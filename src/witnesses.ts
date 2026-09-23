import { webcrypto } from 'node:crypto';
import { pureCircuits, type Ledger, type Witnesses } from '../managed/candor/contract/index.js';

export type Credential = {
  readonly tier: bigint;
  readonly blind: Uint8Array;
};

export type CandorPrivateState = {
  readonly secret: Uint8Array;
  readonly credential?: Credential;
  readonly issuerSecret?: Uint8Array;
};

const randomBytes = (): Uint8Array => webcrypto.getRandomValues(new Uint8Array(32));

export const createPrivateState = (secret?: Uint8Array): CandorPrivateState => ({
  secret: secret ?? randomBytes(),
});

export const createCredential = (tier: number | bigint, blind?: Uint8Array): Credential => ({
  tier: BigInt(tier),
  blind: blind ?? randomBytes(),
});

export const withCredential = (state: CandorPrivateState, credential: Credential): CandorPrivateState => ({
  ...state,
  credential,
});

export const withIssuer = (state: CandorPrivateState, issuerSecret?: Uint8Array): CandorPrivateState => ({
  ...state,
  issuerSecret: issuerSecret ?? randomBytes(),
});

export const commitmentOf = (state: CandorPrivateState): Uint8Array => pureCircuits.commitment(state.secret);

export const nullifierOf = (state: CandorPrivateState): Uint8Array => pureCircuits.nullifier(state.secret);

export const issuerKeyOf = (issuerSecret: Uint8Array): Uint8Array => pureCircuits.issuerKeyOf(issuerSecret);

export const credentialLeafFor = (holder: Uint8Array, credential: Credential): Uint8Array =>
  pureCircuits.credentialLeaf(holder, credential.tier, credential.blind);

export const credentialLeafOf = (state: CandorPrivateState, credential = state.credential): Uint8Array => {
  if (!credential) throw new Error('this member holds no credential for the poll');
  return credentialLeafFor(commitmentOf(state), credential);
};

export const witnesses: Witnesses<CandorPrivateState> = {
  memberSecret: ({ privateState }) => [privateState, privateState.secret],

  memberTier: ({ privateState }) => {
    if (!privateState.credential) {
      throw new Error('this browser holds no credential for the poll');
    }
    return [privateState, privateState.credential.tier];
  },

  credentialBlind: ({ privateState }) => {
    if (!privateState.credential) {
      throw new Error('this browser holds no credential for the poll');
    }
    return [privateState, privateState.credential.blind];
  },

  credentialPath: ({ ledger, privateState }: { ledger: Ledger; privateState: CandorPrivateState }) => {
    const leaf = credentialLeafOf(privateState);
    const path = ledger.credentials.findPathForLeaf(leaf);
    if (path === undefined) {
      throw new Error('no credential has been issued for this member');
    }
    return [privateState, path];
  },

  memberPath: ({ ledger, privateState }: { ledger: Ledger; privateState: CandorPrivateState }) => {
    const leaf = pureCircuits.commitment(privateState.secret);
    const path = ledger.roster.findPathForLeaf(leaf);
    if (path === undefined) {
      throw new Error('this secret is not enrolled in the poll');
    }
    return [privateState, path];
  },

  issuerSecret: ({ privateState }) => {
    if (!privateState.issuerSecret) {
      throw new Error('this browser does not hold the issuer key for the poll');
    }
    return [privateState, privateState.issuerSecret];
  },
};
