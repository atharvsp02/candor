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
    items: [
      'Hash of every issued credential',
      'Roster of member commitments',
      'Spent nullifiers',
      'Ballot count per option',
    ],
  },
  {
    label: 'In the proof',
    badge: 'Zero-knowledge',
    title: 'Proven, never shown',
    sub: 'Checked by the network without naming you',
    lead: 'Proves that:',
    items: [
      'Your credential was issued for this poll',
      'Its tier clears the threshold',
      'Your commitment is in the roster',
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
      'The tier your credential grants',
      'The blinding factor that hides it',
      'The link between you and your ballot',
    ],
  },
];
