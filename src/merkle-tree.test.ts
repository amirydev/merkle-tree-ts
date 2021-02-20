import { MerkleTree, Proof } from '.';
import hasher from 'crypto-js/sha3';
import encoder from 'crypto-js/enc-base64';

describe('MerkleTree', () => {
    describe('rootHash', () => {
        it('should create a merkle root', () => {
            const mt = new MerkleTree(hasher, encoder, ['aaa', 'bbb', 'ccc']);
            const root = mt.rootHash();
            expect(root).toEqual(
                'ScIuiTF4x8dp9wAGhKzmqVeNQHqXV/Gy4SaCszW/YPOGBJ3tfmfVBbG0bk16OfS9aPxNLk2s5V4lr5/+aFfAWg==',
            );
        });
        it('should handle zero leaves', () => {
            const mt = new MerkleTree(hasher, encoder);
            const root = mt.rootHash();
            expect(root).toEqual('');
        });
    });

    describe('height', () => {
        it('should return currect height merkle root', () => {
            const mt = new MerkleTree(hasher, encoder, ['aaa', 'bbb', 'ccc']);
            expect(mt.height()).toEqual(2);
        });
        it('should handle zero leaves', () => {
            const mt = new MerkleTree(hasher, encoder);
            expect(mt.height()).toEqual(0);
        });
    });

    describe('addLeaves', () => {
        it('should add the given leaves to the tree', () => {
            const mt = new MerkleTree(hasher, encoder);
            mt.addLeaves('aaa', 'bbb', 'ccc');
            expect(mt.height()).toEqual(2);
        });
    });

    describe('verify', () => {
        it('should verify the proof', () => {
            const mt = new MerkleTree(hasher, encoder, ['aaa', 'bbb', 'ccc']);
            mt.rootHash();
            const proof: Proof = {
                path: [
                    {
                        dir: 0,
                        data:
                            'rEXF4ALsag+SQM0qk276UoJarrOL0e+EmWN9A4dwJz/te0NSG8PslhVQSLoGn8WK9LB7TMUf10iAfG7EVnq64w==',
                    },
                    {
                        dir: 1,
                        data:
                            'wHzvzcqOjAxjXJ2JkCAiTTKjqzqyHNVxp8WvRFr+6hk1uzzzBa8mJd1P7vWtYy1Kf7SakUDeNdIIThH4jjVdKg==',
                    },
                ],
                data:
                    'X+5VKciDopF2eZsOzhi6fdj7xX5oStEfbsls2SM7MwEEkjFtb1mKpCQP5SFeuXZfiwVNz7Iutm8Mz3yUw07VLQ==',
            };
            expect(mt.verify(proof)).toBeTruthy();
        });

        it('should verify non-valid proof', () => {
            const mt = new MerkleTree(hasher, encoder, ['aaa', 'bbb', 'ccc']);
            const proof: Proof = {
                path: [
                    { dir: 0, data: 'xxx' },
                    {
                        dir: 1,
                        data:
                            'wHzvzcqOjAxjXJ2JkCAiTTKjqzqyHNVxp8WvRFr+6hk1uzzzBa8mJd1P7vWtYy1Kf7SakUDeNdIIThH4jjVdKg==',
                    },
                ],
                data:
                    'X+5VKciDopF2eZsOzhi6fdj7xX5oStEfbsls2SM7MwEEkjFtb1mKpCQP5SFeuXZfiwVNz7Iutm8Mz3yUw07VLQ==',
            };
            expect(mt.verify(proof)).toBeFalsy();
        });
    });

    describe('getProof', () => {
        it('should create a valid proof', () => {
            const mt = new MerkleTree(hasher, encoder, [
                'aaa',
                'bbb',
                'ccc',
                'ddd',
                'eee',
                'fff',
            ]);
            const proof = mt.getProof(1);
            expect(mt.verify(proof)).toBeTruthy();
        });
    });
});
