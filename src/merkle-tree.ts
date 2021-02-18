import { lib } from 'crypto-js';

export type Hasher = (message: lib.WordArray | string) => lib.WordArray;

export interface Encoder {
    stringify(wordArray: lib.WordArray): string;
    parse(str: string): lib.WordArray;
}

export interface MerkleNode {
    left?: MerkleNode;
    right?: MerkleNode;
    data: string;
    height?: number;
}

export interface Proof {
    path: MerkleTreePath[];
    data: string;
}

export interface MerkleTreePath {
    dir: number;
    data: string;
}

export class MerkleTree {
    root: MerkleNode | undefined;

    constructor(
        private readonly hasher: Hasher,
        private readonly encoder: Encoder,
        private leaves: string[] = [],
    ) {}

    addLeaves(...leaves: string[]): MerkleTree {
        for (const leaf of leaves) {
            this.leaves.push(leaf);
        }
        return this;
    }

    height(): number {
        let n = this.leaves.length;
        n % 2 !== 0 && n++;
        return n / 2;
    }

    hash(iterator?: nodeIterator): string {
        // creating the tree bottom up, starting from leaves
        const leaves = [...this.leaves];
        let n = leaves.length;
        if (n === 0) {
            return '';
        }
        // ensure even number of leaves by duplicating the last leaf
        if (n % 2 !== 0) {
            leaves.push(leaves[n - 1]);
            n++;
        }
        let nodes: MerkleNode[] = leaves.map(
            (leaf: string): MerkleNode => {
                const node = {
                    data: hash(this.hasher, this.encoder, leaf),
                    height: 0,
                };
                !!iterator && iterator(node);
                return node;
            },
        );
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
        this.root = nodes[0];

        return this.root.data;
    }

    getProof(i: number): Proof {
        const levels: MerkleNode[][] = [];
        this.hash((current: MerkleNode, height?: number) => {
            if (typeof height !== 'number') {
                height = 0;
            }
            if (!levels[height]) {
                levels[height] = [];
            }
            levels[height].push(current);
        });
        const proofData = levels[0][i].data;
        const proof: Proof = {
            path: [],
            data: proofData,
        };
        const h = this.height();
        let data = proofData;
        for (let j = 0; j < h; j++) {
            let iNeighbor = i + 1;
            if (i % 2 !== 0) {
                iNeighbor = i - 1;
            }
            proof.path.push({
                dir: i % 2 === 0 ? 1 : 0,
                data: levels[j][iNeighbor].data,
            });
            const level = levels[j + 1];
            if (!level) {
                break;
            }
            // decide what is the value of 'i' in the next level
            for (let iLevel = 0; iLevel < level.length; iLevel++) {
                if (
                    level[iLevel].right?.data === data ||
                    level[iLevel].left?.data === data
                ) {
                    i = iLevel;
                    data = level[iLevel].data;
                    break;
                }
            }
        }
        return proof;
    }

    verify(proof: Proof): boolean {
        return (
            !!this.root?.data &&
            verify(this.hasher, this.encoder, proof, this.root.data)
        );
    }
}

const hash = (hasher: Hasher, encoder: Encoder, data: string): string => {
    return hasher(data).toString(encoder);
};

export const verify = (
    hasher: Hasher,
    encoder: Encoder,
    proof: Proof,
    root: string,
): boolean => {
    const proofRoot = proofToRoot(hasher, encoder, proof);

    return proofRoot === root;
};

export type nodeIterator = (current: MerkleNode, height?: number) => void;

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

// const buildPath = (): MerkleTreePath => {

// }
