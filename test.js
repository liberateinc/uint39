const test = require('tape')
const UInt39 = require('./uint39')

function sunnyTestUInt39 (num, fullBuf, optimizedBuf) {
  return t => {
    let uint39
    t.plan(8)

    t.doesNotThrow(() => {
      uint39 = UInt39.fromNumber(num)
    }, undefined, 'must not throw errors on initialization')

    t.ok(uint39 instanceof UInt39, 'must return a UInt39')
    t.deepEqual(uint39.toBigInt(), BigInt(num), 'must be able to return an exact bigint')
    t.strictEqual(uint39.toNumber(), num, 'must be able to return an exact number')
    t.deepEqual(uint39.toBuffer(), fullBuf, 'must return an exact buffer')

    // optimized representation
    const sizeOptimized = uint39.sizeOptimized()
    t.ok(Buffer.isBuffer(sizeOptimized), 'must return a buffer when optimized')
    t.equal(sizeOptimized.length, optimizedBuf.length, 'must return the correct optimized size')
    t.deepEqual(sizeOptimized, optimizedBuf, 'must return the expected optimized buffer')

    t.end()
  }
}

test(
  'UInt39: Given a number 0',
  sunnyTestUInt39(0, Buffer.from('0000000000', 'hex'), Buffer.from('00', 'hex'))
)

test(
  'UInt39: Given a number 1',
  sunnyTestUInt39(1, Buffer.from('0000000001', 'hex'), Buffer.from('01', 'hex'))
)

test(
  'UInt39: Given a number 255',
  sunnyTestUInt39(255, Buffer.from('00000000ff', 'hex'), Buffer.from('00ff', 'hex'))
)

test(
  'UInt39: Given a number 2^20',
  sunnyTestUInt39(Math.pow(2, 20), Buffer.from('0000100000', 'hex'), Buffer.from('100000', 'hex'))
)

test(
  'UInt39: Given a number 2^39 - 1',
  sunnyTestUInt39(Math.pow(2, 39) - 1, Buffer.from('7fffffffff', 'hex'), Buffer.from('7fffffffff', 'hex'))
)

test('UInt39: Given a number 2^39', t => {
  const subj = Math.pow(2, 39)
  t.plan(1)

  t.throws(() => {
    UInt39.fromNumber(subj)
  }, undefined, 'must throw an error on initialization')

  t.end()
})

test('UInt39: Given a number -1', t => {
  const subj = -1
  t.plan(1)

  t.throws(() => {
    UInt39.fromNumber(subj)
  }, undefined, 'must throw an error on initialization')

  t.end()
})
