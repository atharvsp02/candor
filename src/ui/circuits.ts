export type Circuit = {
  readonly name: string;
  readonly args: string;
  readonly kind: 'impure' | 'pure' | 'ledger';
  readonly result: string;
  readonly note: string;
  readonly effect: string;
};

export const CIRCUITS: readonly Circuit[] = [
  {
    name: 'enroll',
    args: '()',
    kind: 'impure',
    result: 'roster.insert(leaf)',
    note: '+1 member',
    effect: 'Adds a hash of your secret to the roster, once per member.',
  },
  {
    name: 'vote',
    args: '(choice)',
    kind: 'impure',
    result: 'spent.insert(tag)',
    note: '+1 ballot',
    effect: 'Spends a nullifier and moves the count for the option you picked.',
  },
  {
    name: 'commitment',
    args: '(sk)',
    kind: 'pure',
    result: 'persistentHash',
    note: 'member:v1',
    effect: 'Derives the roster entry from your secret.',
  },
  {
    name: 'nullifier',
    args: '(sk)',
    kind: 'pure',
    result: 'persistentHash',
    note: 'nullifier:v1',
    effect: 'Derives the one-time tag that blocks a second ballot.',
  },
  {
    name: 'checkRoot',
    args: '(root)',
    kind: 'ledger',
    result: 'MerkleTree<10>',
    note: 'depth 10',
    effect: 'Confirms the proof was built against the real roster.',
  },
];
