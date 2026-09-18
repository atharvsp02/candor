import { useEffect, useState } from 'react';
import type { TallyView } from '../view';
import { fetchHistory, fetchLatest, type ChainEvent } from './indexer';

export type LivePoll = {
  readonly status: 'loading' | 'ready' | 'missing' | 'error';
  readonly tally: TallyView | null;
  readonly events: readonly ChainEvent[] | null;
  readonly historyFailed: boolean;
  readonly height: number | null;
};

const INITIAL: LivePoll = { status: 'loading', tally: null, events: null, historyFailed: false, height: null };

export const useLivePoll = (address: string, refreshKey = 0): LivePoll => {
  const [poll, setPoll] = useState<LivePoll>(INITIAL);

  useEffect(() => {
    if (!address) {
      setPoll({ ...INITIAL, status: 'missing' });
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const load = async () => {
      try {
        const latest = await fetchLatest(address, signal);
        if (signal.aborted) return;
        if (!latest) {
          setPoll({ ...INITIAL, status: 'missing' });
          return;
        }
        const { decodeTally } = await import('./decode');
        const tally = decodeTally(latest.state);
        if (signal.aborted) return;
        setPoll((current) => ({ ...current, status: 'ready', tally, height: latest.height }));
        const events = await fetchHistory(address, latest.hash, signal);
        if (!signal.aborted) setPoll((current) => ({ ...current, events, historyFailed: false }));
      } catch {
        if (!signal.aborted) {
          setPoll((current) => ({
            ...current,
            status: current.tally ? 'ready' : 'error',
            historyFailed: current.events === null,
          }));
        }
      }
    };

    void load();
    return () => controller.abort();
  }, [address, refreshKey]);

  return poll;
};
