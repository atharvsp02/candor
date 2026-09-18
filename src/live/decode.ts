import { ContractState } from '@midnight-ntwrk/compact-runtime';
import { ledger } from '../../managed/candor/contract/index.js';
import { tallyView, type TallyView } from '../view';

const bytes = (hex: string) => Uint8Array.from(hex.match(/../g) ?? [], (pair) => Number.parseInt(pair, 16));

export const decodeTally = (stateHex: string): TallyView => {
  const view = ledger(ContractState.deserialize(bytes(stateHex)).data);
  return tallyView({
    enrolled: view.enrolled,
    cast: view.cast,
    spent: view.spent.size(),
    counts: Array.from({ length: Number(view.choices) }, (_, i) => view.tally.lookup(BigInt(i)).read()),
  })!;
};
