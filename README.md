# merkle-tree

**NOTE: WIP**

A library for working with merkle trees, including root hash calculation, proof generation and verification.

The hash and encoding interfaces are based on [crypto-js](https://github.com/brix/crypto-js) for a custom tree.

## Install

**will be available in npm soon**

```bash
npm i merkle-tree-ts
```

From github > `npm i https://github.com/amirylm/merkle-tree`

## Usage

`MarkleTree` class and `verify()` function accepts a custom hash function and encoder to be used, see the following example:

```typescript

import { MerkleTree, verify } from 'merkle-tree-ts';
import hasher from 'crypto-js/sha3';
import encoder from 'crypto-js/enc-base64';

const mt = new MerkleTree(hasher, encoder, ['aaa', 'bbb', 'ccc']);
const root = mt.rootHash();
console.log(root);
// ScIuiTF4x8dp9wAGhKzmqVeNQHqXV/Gy4SaCszW/YPOGBJ3tfmfVBbG0bk16OfS9aPxNLk2s5V4lr5/+aFfAWg==

let proof = mt.getProof(0);
console.log(verify(hasher, encoder, proof, root));
// true
proof = mt.getProof(1);
console.log(proof);
// {
//   path: [
//     {
//       dir: 0,
//       data: 'rEXF4ALsag+SQM0qk276UoJarrOL0e+EmWN9A4dwJz/te0NSG8PslhVQSLoGn8WK9LB7TMUf10iAfG7EVnq64w=='
//     },
//     {
//       dir: 1,
//       data: 'wHzvzcqOjAxjXJ2JkCAiTTKjqzqyHNVxp8WvRFr+6hk1uzzzBa8mJd1P7vWtYy1Kf7SakUDeNdIIThH4jjVdKg=='
//     }
//   ],
//   data: 'X+5VKciDopF2eZsOzhi6fdj7xX5oStEfbsls2SM7MwEEkjFtb1mKpCQP5SFeuXZfiwVNz7Iutm8Mz3yUw07VLQ=='
// }

```
