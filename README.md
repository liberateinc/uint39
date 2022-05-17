UInt39
------

Javascript library to read and write 39-bit unsigned integer buffers, useful
when working with Bitcoin BIP-65 scripts.

### Usage

```js
const UInt39 = require('uint39')
const one = UInt39.fromBigInt(BigInt(1))
const max = UInt39.fromNumber(Math.pow(2, 39) - 1)

one.sizeOptimized() // returns Buffer { 0x01 }
one.toBuffer() // returns Buffer { 0x00 0x00 0x00 0x00 0x01 }
max.sizeOptimized() // returns Buffer { 0x7f 0xff 0xff 0xff 0xff }

const reverse = UInt39.fromBuffer(Buffer.from('1337', 'hex'))
reverse.toNumber() // returns 4919
```
