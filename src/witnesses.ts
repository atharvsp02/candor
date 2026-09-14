import { webcrypto } from 'node:crypto';
import { pureCircuits, type Ledger, type Witnesses } from '../managed/candor/contract/index.js';

export type CandorPrivateState = {
  readonly secret: Uint8Array;
};

export const createPrivateState = (secret?: Uint8Array): CandorPrivateState => ({
  secret: secret ?? webcrypto.getRandomValues(new Uint8Array(32)),
});

export const commitmentOf = (state: CandorPrivateState): Uint8Array =>
  pureCircuits.commitment(state.secret);

export const nullifierOf = (state: CandorPrivateState): Uint8Array =>
  pureCircuits.nullifier(state.secret);

export const witnesses: Witnesses<CandorPrivateState> = {
  memberSecret: ({ privateState }) => [privateState, privateState.secret],

  memberPath: ({ ledger, privateState }: { ledger: Ledger; privateState: CandorPrivateState }) => {
    const leaf = pureCircuits.commitment(privateState.secret);
    const path = ledger.roster.findPathForLeaf(leaf);
    if (path === undefined) {
      throw new Error('this secret is not enrolled in the poll');
    }
    return [privateState, path];
  },
};
