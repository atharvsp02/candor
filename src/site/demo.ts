import type { DashboardProps } from '../app/Dashboard';

const noop = () => undefined;
const CONTRACT = 'ec565faac3103ff42017cebd3cc2510407b2068aa164ee54349ed7f0305e9e29';
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000);

export const demoDashboard = (): DashboardProps => ({
  status: { kind: 'connected', wallet: 'lace', address: 'a41f9e0c2d7b58e3f6019bd4c27e5a8d3b1f06c9e2d4478a' },
  tally: { enrolled: 128, cast: 91, spent: 91, counts: [53, 29, 9] },
  privacy: {
    commitment: '3fa1c09b77e24d5a0b8e16c3f92d4e70a5b3c18d6e2f9041b7c5d3e8a9f0c12b',
    nullifier: '9d02e7c4b1a8563f2e0d9c7b6a5f4e3d2c1b0a9f8e7d6c5b4a39281706f5e4d3',
    enrolled: true,
    voted: false,
    anonymitySet: 128,
  },
  busy: null,
  notice: null,
  contractAddress: CONTRACT,
  networkId: 'preprod',
  proverUri: 'http://localhost:6300',
  shareUrl: `${window.location.origin}/app?poll=${CONTRACT}`,
  activity: [
    { id: 2, at: minutesAgo(1), title: 'Enrolment confirmed', detail: 'accepted on chain', tone: 'ok' },
    { id: 1, at: minutesAgo(3), title: 'Connected lace', detail: 'a41f9e0c2d…e2d4478a', tone: 'info' },
  ],
  preview: true,
  onConnect: noop,
  onDisconnect: noop,
  onCreatePoll: noop,
  onEnrol: noop,
  onVote: noop,
  onRefresh: noop,
});
