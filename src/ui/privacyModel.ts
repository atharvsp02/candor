export type PrivacyLayer = {
  readonly label: string;
  readonly badge?: string;
  readonly title: string;
  readonly sub: string;
  readonly lead: string;
  readonly items: readonly string[];
};

export const PRIVACY_LAYERS: readonly PrivacyLayer[] = [
  {
    label: 'On chain',
    title: 'Public ledger',
    sub: 'Readable by anyone, forever',
    lead: 'Holds:',
    items: ['Roster of member commitments', 'Spent nullifiers', 'Ballot count per option', 'Totals enrolled and cast'],
  },
  {
    label: 'In the proof',
    badge: 'Zero-knowledge',
    title: 'Proven, never shown',
    sub: 'Checked by the network without naming you',
    lead: 'Proves that:',
    items: [
      'Your commitment is in the roster',
      'Your nullifier comes from the same secret',
      'Your choice is on the ballot',
      'You have not voted before',
    ],
  },
  {
    label: 'In your browser',
    title: 'Never on chain',
    sub: 'Kept on your device',
    lead: 'Keeps:',
    items: [
      'Your 32-byte member secret',
      'Your Merkle path',
      'The witnesses behind each proof',
      'The link between you and your ballot',
    ],
  },
];
