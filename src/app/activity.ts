import type { ChainEvent } from '../live/indexer';
import type { ActivityEntry } from './Dashboard';

export const EVENT_TITLES: Record<ChainEvent['kind'], string> = {
  deploy: 'Poll deployed',
  enroll: 'Member enrolled',
  vote: 'Ballot cast',
  update: 'Contract updated',
};

export const chainActivity = (events: readonly ChainEvent[]): ActivityEntry[] =>
  events.map((event) => ({
    id: event.hash,
    at: event.at,
    title: EVENT_TITLES[event.kind],
    detail: `block ${event.height.toLocaleString()}`,
    tone: event.kind === 'vote' ? 'ok' : 'info',
  }));

export const latestFirst = (entries: readonly ActivityEntry[], limit = 6) =>
  [...entries].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
