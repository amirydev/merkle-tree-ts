import { lib } from 'crypto-js';

// custom hash function to be used
// based on crypto-js
export type Hasher = (message: lib.WordArray | string) => lib.WordArray;

// custom encoding to stringify the hash output
// based on crypto-js
export interface Encoder {
    stringify(wordArray: lib.WordArray): string;
    parse(str: string): lib.WordArray;
}

// represents a single node in the merkle tree
export interface MerkleNode {
    left?: MerkleNode;
    right?: MerkleNode;
    data: string;
    height?: number;
}

// represents a proof to validate existence of a specific leaf
export interface Proof {
    path: MerkleTreePath[];
    data: string;
}

// represents a path of some merkle proof
export interface MerkleTreePath {
    dir: number;
    data: string;
}

// class that represents a MerkleTree
// contains methods for creating root hash, proofs and verification
export class MerkleTree {
    root: MerkleNode | undefined;

    constructor(
        private readonly hasher: Hasher,
        private readonly encoder: Encoder,
        private leaves: string[] = [],
    ) {}

    // adds more leaves to the tree
    public addLeaves(...leaves: string[]): MerkleTree {
        for (const leaf of leaves) {
            this.leaves.push(leaf);
        }
        return this;
    }

    // returns the tree height
    public height(): number {
        let n = this.leaves.length;
        n % 2 !== 0 && n++;
        return n / 2;
    }

    // creates a merkle tree root hash.
    // starting from leaves and builds it bottom up
    public rootHash(iterator?: nodeIterator): string {
        const nodes = this.getLeafNodes(iterator);
        if (nodes.length === 0) {
            return '';
        }
        this.root = this.leafNodesToRoot(nodes, iterator);

        return this.root.data;
    }

    // creates a proof for the given leaf
    public getProof(i: number): Proof {
        const levels = this.getLevels();
        const proofData = levels[0][i].data;
        const proof: Proof = {
            path: [],
            data: proofData,
        };
        const height = this.height();
        let data = proofData;
        for (let l = 0; l < height; l++) {
            let iNeighbor = i + 1;
            if (i % 2 !== 0) {
                iNeighbor = i - 1;
            }
            proof.path.push({
                dir: i % 2 === 0 ? 1 : 0,
                data: levels[l][iNeighbor].data,
            });
            const level = levels[l + 1];
            [i, data] = this.nextLevel(level, data);
        }
        return proof;
    }

    // verifies the given proof
    public verify(proof: Proof): boolean {
        return (
            !!this.root?.data &&
            verify(this.hasher, this.encoder, proof, this.root.data)
        );
    }

    // returns a level matrix
    private getLevels(): MerkleNode[][] {
        const levels: MerkleNode[][] = [];
        this.rootHash((current: MerkleNode, height?: number) => {
            if (typeof height !== 'number') {
                height = 0;
            }
            if (!levels[height]) {
                levels[height] = [];
            }
            levels[height].push(current);
        });
        return levels;
    }

    // decide what are the values in the next level
    private nextLevel(
        level: MerkleNode[],
        currentData: string,
    ): [number, string] {
        for (let iLevel = 0; iLevel < level.length; iLevel++) {
            if (
                level[iLevel].right?.data === currentData ||
                level[iLevel].left?.data === currentData
            ) {
                return [iLevel, level[iLevel].data];
            }
        }
        return [-1, ''];
    }

    // returns a normalized list of leaf nodes
    private getLeafNodes(iterator?: nodeIterator): MerkleNode[] {
        const leaves = [...this.leaves];
        let n = leaves.length;
        if (n === 0) {
            return [];
        }
        // ensure even number of leaves by duplicating the last leaf
        if (n % 2 !== 0) {
            leaves.push(leaves[n - 1]);
            n++;
        }
        // transform leaves to nodes
        return leaves.map(
            (leaf: string): MerkleNode => {
                const node = {
                    data: hash(this.hasher, this.encoder, leaf),
                    height: 0,
                };
                !!iterator && iterator(node);
                return node;
            },
        );
    }

    // takes a list of leaf nodes and turns it into root hash
    private leafNodesToRoot(
        nodes: MerkleNode[],
        iterator?: nodeIterator,
    ): MerkleNode {
        const n = nodes.length;
        for (let h = 0; h < n / 2; h++) {
            const level: MerkleNode[] = [];
            for (let i = 0; i < nodes.length; i += 2) {
                const left = nodes[i];
                const right = nodes[i + 1];
                if (left && right) {
                    const data = hash(
                        this.hasher,
                        this.encoder,
                        left.data + right.data,
                    );
                    const node = { data, left, right };
                    !!iterator && iterator(node, h + 1);
                    level.push(node);
                }
            }
            if (level.length % 2) {
                level.push(level[level.length - 1]);
            }
            nodes = [...level];
        }
        return nodes[0];
    }
}

const hash = (hasher: Hasher, encoder: Encoder, data: string): string => {
    return hasher(data).toString(encoder);
};

// verifies the given proof with the provided hasher and encoder
export const verify = (
    hasher: Hasher,
    encoder: Encoder,
    proof: Proof,
    root: string,
): boolean => {
    const proofRoot = proofToRoot(hasher, encoder, proof);

    return proofRoot === root;
};

// iterator for looping on nodes
export type nodeIterator = (current: MerkleNode, height?: number) => void;

// creates a root hash from the given proof
const proofToRoot = (
    hasher: Hasher,
    encoder: Encoder,
    proof: Proof,
): string => {
    if (proof.path.length === 0) {
        return proof.data;
    }

    const item = proof.path.shift();
    if (!item) {
        return '';
    }

    let current = '';
    if (item.dir === 0) {
        current = item.data + proof.data;
    } else {
        current = proof.data + item.data;
    }

    return proofToRoot(hasher, encoder, {
        path: proof.path,
        data: hash(hasher, encoder, current),
    });
};
