import { MerkleTree } from 'merkletreejs';
import SHA256 from 'crypto-js/sha256';

const leaves = ['a', 'b', 'c', 'd'].map((x) => {
  let hashed = SHA256(x);
  console.log({ hashed });

  return hashed;
});

const tree = new MerkleTree(leaves, SHA256);

console.log({ tree });

const root = tree.getRoot();
console.log({ root });

const hexRoot = tree.getHexRoot();

const leaf = SHA256('b');
const proof = tree.getProof(leaf);

console.log({ leaf });

console.log({ proof });

const verified = tree.verify(proof, leaf, root);
console.log('Proof verified:', verified);
