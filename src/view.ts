import type { PrivacyFacts, Tally } from './hooks/useMidnight';

export type TallyView = {
  readonly question: string;
  readonly labels: readonly string[];
  readonly enrolled: number;
  readonly cast: number;
  readonly spent: number;
  readonly counts: readonly number[];
};

export type PrivacyView = Omit<PrivacyFacts, 'anonymitySet'> & {
  readonly anonymitySet: number;
};

export const tallyView = (tally: Tally | null): TallyView | null =>
  tally && {
    question: tally.question,
    labels: tally.labels,
    enrolled: Number(tally.enrolled),
    cast: Number(tally.cast),
    spent: Number(tally.spent),
    counts: tally.counts.map(Number),
  };

export const privacyView = (privacy: PrivacyFacts | null): PrivacyView | null =>
  privacy && { ...privacy, anonymitySet: Number(privacy.anonymitySet) };
