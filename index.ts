import { MerkleTree } from 'merkletreejs';
import { createHash } from 'node:crypto';

function sha256(data: Buffer | string): Buffer {
  return createHash('sha256').update(data).digest();
}

interface TradeSettlement {
  orderId: string;
  user: string;
  baseToken: string;
  quoteToken: string;
  side: 'BUY' | 'SELL';
  price: number;
  amount: number;
  settledAt: number;
}

function tradeToLeaf(t: TradeSettlement): Buffer {
  const payload = [
    t.orderId,
    t.user.toLowerCase(),
    t.baseToken,
    t.quoteToken,
    t.side,
    t.price.toFixed(8),
    t.amount.toFixed(8),
    t.settledAt,
  ].join(':');
  return sha256(Buffer.from(payload, 'utf8'));
}

const batch: TradeSettlement[] = [
  {
    orderId: 'LMT-001',
    user: '0xAAA...',
    baseToken: 'SOL',
    quoteToken: 'USDC',
    side: 'BUY',
    price: 142.3,
    amount: 10,
    settledAt: 1718000000,
  },
  {
    orderId: 'LMT-002',
    user: '0xBBB...',
    baseToken: 'SOL',
    quoteToken: 'USDC',
    side: 'SELL',
    price: 143.1,
    amount: 5,
    settledAt: 1718000001,
  },
  {
    orderId: 'LMT-003',
    user: '0xCCC...',
    baseToken: 'SOL',
    quoteToken: 'USDC',
    side: 'BUY',
    price: 141.8,
    amount: 20,
    settledAt: 1718000002,
  },
  {
    orderId: 'LMT-004',
    user: '0xDDD...',
    baseToken: 'SOL',
    quoteToken: 'USDC',
    side: 'SELL',
    price: 144.0,
    amount: 15,
    settledAt: 1718000003,
  },
];

console.log({ tradeToLeaf });

const leaves = batch.map(tradeToLeaf);
const tree = new MerkleTree(leaves, sha256);
const root = tree.getHexRoot();
console.log('Merkle root :', root);

const idx = 1;
const targetLeaf = leaves[idx];
const proof = tree.getProof(targetLeaf, idx);

console.log('User');
console.log('Trade:', JSON.stringify(batch[idx], null, 2));
console.log('Leaf hash:', targetLeaf.toString('hex'));
console.log(
  'Proof siblings:',
  proof.map((p: any) => p.data.toString('hex')),
);
console.log('Proof length:', proof.length);

const ok = tree.verify(proof, targetLeaf, root);
console.log('Verified with root', ok);

const tamperedLeaf = tradeToLeaf({ ...batch[idx], amount: 9999 });

console.log('Verified tampered trade', tree.verify(proof, tamperedLeaf, root));
