import type { Ledger } from '../managed/candor/contract/index.js';
import { optionLabel } from './ui/format';

export const questionOf = (state: Ledger): string => {
  try {
    return String(state.question);
  } catch {
    return '';
  }
};

export const labelsOf = (state: Ledger): string[] =>
  Array.from({ length: Number(state.choices) }, (_, i) => {
    try {
      const key = BigInt(i);
      return state.options.member(key) ? String(state.options.lookup(key)) : optionLabel(i);
    } catch {
      return optionLabel(i);
    }
  });
