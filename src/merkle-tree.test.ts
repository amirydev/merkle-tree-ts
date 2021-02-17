import { MerkleTree, Proof } from './merkle-tree';
import hash from 'crypto-js/sha3';
import enc from 'crypto-js/enc-base64';

describe('merkle-tree', () => {
    describe('hash', () => {
        it('should create a merkle root', () => {
            const mt = new MerkleTree(hash, enc, ["aaa", "bbb", "ccc"]);
            const root = mt.hash();
            expect(root).toEqual('ScIuiTF4x8dp9wAGhKzmqVeNQHqXV/Gy4SaCszW/YPOGBJ3tfmfVBbG0bk16OfS9aPxNLk2s5V4lr5/+aFfAWg==');
        });
    });

    describe('height', () => {
        it('should return currect height merkle root', () => {
            const mt = new MerkleTree(hash, enc, ["aaa", "bbb", "ccc"]);
            expect(mt.height()).toEqual(2);
        });
    });

    describe('verify', () => {
        it('should verify the proof', () => {
            const mt = new MerkleTree(hash, enc, ["aaa", "bbb", "ccc"]);
            mt.hash(console.log);
            const proof: Proof = {
                path: [
                    { dir: 0, data: 'rEXF4ALsag+SQM0qk276UoJarrOL0e+EmWN9A4dwJz/te0NSG8PslhVQSLoGn8WK9LB7TMUf10iAfG7EVnq64w==' },
                    { dir: 1, data: 'wHzvzcqOjAxjXJ2JkCAiTTKjqzqyHNVxp8WvRFr+6hk1uzzzBa8mJd1P7vWtYy1Kf7SakUDeNdIIThH4jjVdKg==' }
                ],
                data: 'X+5VKciDopF2eZsOzhi6fdj7xX5oStEfbsls2SM7MwEEkjFtb1mKpCQP5SFeuXZfiwVNz7Iutm8Mz3yUw07VLQ=='
            };
            expect(mt.verify(proof)).toBeTruthy();
        });

        it('should verify non-valid proof', () => {
            const mt = new MerkleTree(hash, enc, ["aaa", "bbb", "ccc"]);
            mt.hash(console.log);
            const proof: Proof = {
                path: [
                    { dir: 0, data: 'xxx' },
                    { dir: 1, data: 'wHzvzcqOjAxjXJ2JkCAiTTKjqzqyHNVxp8WvRFr+6hk1uzzzBa8mJd1P7vWtYy1Kf7SakUDeNdIIThH4jjVdKg==' }
                ],
                data: 'X+5VKciDopF2eZsOzhi6fdj7xX5oStEfbsls2SM7MwEEkjFtb1mKpCQP5SFeuXZfiwVNz7Iutm8Mz3yUw07VLQ=='
            };
            expect(mt.verify(proof)).toBeFalsy();
        });
    });

    describe('getProof', () => {
        it('should create a proof', () => {
            const mt = new MerkleTree(hash, enc, ["aaa", "bbb", "ccc"]);
            const proof = mt.getProof(1);
            console.log(proof);
            // const proof: Proof = {
            //     path: [
            //         { dir: 0, data: 'rEXF4ALsag+SQM0qk276UoJarrOL0e+EmWN9A4dwJz/te0NSG8PslhVQSLoGn8WK9LB7TMUf10iAfG7EVnq64w==' },
            //         { dir: 1, data: 'wHzvzcqOjAxjXJ2JkCAiTTKjqzqyHNVxp8WvRFr+6hk1uzzzBa8mJd1P7vWtYy1Kf7SakUDeNdIIThH4jjVdKg==' }
            //     ],
            //     data: 'X+5VKciDopF2eZsOzhi6fdj7xX5oStEfbsls2SM7MwEEkjFtb1mKpCQP5SFeuXZfiwVNz7Iutm8Mz3yUw07VLQ=='
            // };
            expect(mt.verify(proof)).toBeTruthy();
        });
    });
});
