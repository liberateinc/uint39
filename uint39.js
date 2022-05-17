'use strict'
const assert = require('assert')

const BUF_SZ = 5

/** A class wrapping a 39-bit unsigned integer in a 5-byte buffer. */
class UInt39 {
  /**
   * Create an UInt39.
   * @param buf {Buffer} - Buffer containing an integer value between 0 and 2^39-1
   *                       in Big Endian encoding.
   */
  constructor (buf) {
    assert(Buffer.isBuffer(buf))
    assert(buf.length === BUF_SZ)
    assert(buf.readUInt8(0) < 0x80)
    this.buf = buf
  }

  /**
   * Transform the 39-bit uint into a BigInt.
   * @returns {BigInt} BigInt representation of the UInt39.
   */
  toBigInt () {
    const bigIntBuf = Buffer.alloc(8)
    this.buf.copy(bigIntBuf, 3, 0, BUF_SZ)
    return bigIntBuf.readBigInt64BE(0)
  }

  /**
   * Transform the 39-bit uint into a number.
   * @returns {number} Numeric representation of the UInt39.
   */
  toNumber () {
    return Number(this.toBigInt())
  }

  /**
   * Return a clone of the internal 5-byte buffer holding the UInt39.
   * @returns {Buffer} 5-byte Buffer in Big Endian encoding.
   */
  toBuffer () {
    const out = Buffer.allocUnsafe(BUF_SZ)
    this.buf.copy(out, 0, 0, BUF_SZ)
    return out
  }

  /**
   * Create a size optimized Buffer representation by removing leading 0x00 elements.
   * @returns {Buffer} 1-5 byte buffer in Big Endian encoding, without leading zeros.
   */
  sizeOptimized () {
    let optimizedBuf

    for (let i = BUF_SZ; i > 1; i--) {
      if (this.buf.readUInt8(BUF_SZ - i) > 0x00 || this.buf.readUInt8(BUF_SZ - i + 1) > 0x7f) {
        optimizedBuf = Buffer.alloc(i)
        this.buf.copy(optimizedBuf, 0, BUF_SZ - i, BUF_SZ)
        break
      }

      // if i == 2 this was the last iteration, so just return the last byte
      if (i === 2) {
        optimizedBuf = Buffer.alloc(1)
        this.buf.copy(optimizedBuf, 0, BUF_SZ - 1, BUF_SZ)
      }
    }

    return optimizedBuf
  }
}

/**
 * Construct a UInt39 from a BigInt source.
 * @param bigint {BigInt} - A BigInt between 0 and 2^39-1.
 * @return {UInt39}
 */
UInt39.fromBigInt = bigint => {
  assert(bigint < BigInt(Math.pow(2, 39)))

  const out = Buffer.alloc(5)

  if (bigint === BigInt(0)) {
    return new UInt39(out)
  }

  const bigIntBuf = Buffer.alloc(8)
  bigIntBuf.writeBigInt64BE(bigint)
  assert(bigIntBuf.readUInt32LE(0) << 8 === 0)

  bigIntBuf.copy(out, 0, 3, 8)

  return new UInt39(out)
}

/**
 * Construct a UInt39 from a number (primitive) source.
 * @param num {number} - A number between 0 and 2^39-1.
 * @return {UInt39}
 */
UInt39.fromNumber = num => {
  return UInt39.fromBigInt(BigInt(num))
}

/**
 * Construct a UInt39 from a Big Endian encoded Buffer source.
 * @param buf {Buffer} - A variable length Buffer, Big Endian encoded
 * @return {UInt39}
 */
UInt39.fromBuffer = buf => {
  const out = Buffer.alloc(5)

  if (buf.length === 0) {
    throw new Error('Cannot read from 0-length buffer')
  }

  let wStart = 0
  let rStart = buf.length - 5
  if (buf.length < 5) {
    wStart = 5 - buf.length
    rStart = 0
  }

  buf.copy(out, wStart, rStart, buf.length)
  return new UInt39(out)
}

module.exports = UInt39
