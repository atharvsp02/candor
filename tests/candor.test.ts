import { describe, expect, it } from 'vitest';
import { createCircuitContext, createConstructorContext, sampleContractAddress } from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, pureCircuits } from '../managed/candor/contract/index.js';
import {
  commitmentOf,
  createCredential,
  createPrivateState,
  credentialLeafFor,
  issuerKeyOf,
  withCredential,
  withIssuer,
  witnesses,
  type CandorPrivateState,
  type Credential,
} from '../src/witnesses.js';

const COIN_PUBLIC_KEY = '0'.repeat(64);

class Poll {
  private readonly contract = new Contract(witnesses);
  private readonly address = sampleContractAddress();
  private state: unknown;
  readonly issuer: CandorPrivateState;

  constructor(optionCount: number, threshold = 0, issuer: CandorPrivateState = withIssuer(createPrivateState())) {
    this.issuer = issuer;
    const { currentContractState } = this.contract.initialState(
      createConstructorContext(issuer, COIN_PUBLIC_KEY),
      BigInt(optionCount),
      BigInt(threshold),
      issuerKeyOf(issuer.issuerSecret!),
    );
    this.state = currentContractState;
  }

  get ledger() {
    return ledger((this.state as any).data ?? this.state);
  }

  private call(name: 'issue' | 'enroll' | 'vote', caller: CandorPrivateState, ...args: unknown[]) {
    const context = createCircuitContext(this.address, COIN_PUBLIC_KEY, this.state as any, caller);
    const { result, context: next } = (this.contract.impureCircuits as any)[name](context, ...args);
    this.state = next.currentQueryContext.state;
    return result;
  }

  issue(member: CandorPrivateState, credential: Credential, issuer = this.issuer): void {
    this.call('issue', issuer, credentialLeafFor(commitmentOf(member), credential));
  }

  admit(member: CandorPrivateState, tier: number): CandorPrivateState {
    const credential = createCredential(tier);
    this.issue(member, credential);
    return withCredential(member, credential);
  }

  enroll(member: CandorPrivateState): Uint8Array {
    return this.call('enroll', member) as Uint8Array;
  }

  vote(member: CandorPrivateState, choice: number): void {
    this.call('vote', member, BigInt(choice));
  }

  counts(): bigint[] {
    const l = this.ledger;
    return Array.from({ length: Number(l.choices) }, (_, i) => l.tally.lookup(BigInt(i)).read());
  }

  nullifiers(): Uint8Array[] {
    return [...this.ledger.spent];
  }
}

const bytes = (value: Uint8Array): string => Buffer.from(value).toString('hex');

describe('circuit logic', () => {
  it('rejects a poll that cannot express a disagreement', () => {
    expect(() => new Poll(1)).toThrow(/at least two options/);
    expect(() => new Poll(9)).toThrow(/at most eight options/);
  });

  it('admits a member and returns the commitment that was stored', () => {
    const poll = new Poll(3);
    const alice = poll.admit(createPrivateState(), 1);

    const leaf = poll.enroll(alice);

    expect(bytes(leaf)).toBe(bytes(pureCircuits.commitment(alice.secret)));
    expect(poll.ledger.enrolled).toBe(1n);
    expect(poll.ledger.roster.findPathForLeaf(leaf)).toBeDefined();
  });

  it('admits a member once, however many times they ask', () => {
    const poll = new Poll(2);
    const alice = poll.admit(createPrivateState(), 1);
    poll.enroll(alice);

    expect(() => poll.enroll(alice)).toThrow(/already enrolled/);
    expect(poll.ledger.enrolled).toBe(1n);
  });

  it('refuses a ballot for an option that is not on it', () => {
    const poll = new Poll(2);
    const alice = poll.admit(createPrivateState(), 1);
    poll.enroll(alice);

    expect(() => poll.vote(alice, 2)).toThrow(/not on the ballot/);
    expect(poll.ledger.cast).toBe(0n);
  });
});

describe('eligibility gate', () => {
  it('lets a credential at the threshold through', () => {
    const poll = new Poll(2, 2);
    const alice = poll.admit(createPrivateState(), 2);

    poll.enroll(alice);

    expect(poll.ledger.enrolled).toBe(1n);
    expect(poll.ledger.minTier).toBe(2n);
  });

  it('turns away a credential below the threshold', () => {
    const poll = new Poll(2, 3);
    const alice = poll.admit(createPrivateState(), 2);

    expect(() => poll.enroll(alice)).toThrow(/below the poll's threshold/);
    expect(poll.ledger.enrolled).toBe(0n);
  });

  it('turns away a member with no credential at all', () => {
    const poll = new Poll(2, 1);
    const stranger = createPrivateState();

    expect(() => poll.enroll(stranger)).toThrow(/holds no credential/);
    expect(poll.ledger.enrolled).toBe(0n);
  });

  it('refuses a credential that was issued to somebody else', () => {
    const poll = new Poll(2, 1);
    const alice = poll.admit(createPrivateState(), 3);
    const mallory = withCredential(createPrivateState(), alice.credential!);

    expect(() => poll.enroll(mallory)).toThrow(/no credential has been issued/);
    expect(poll.ledger.enrolled).toBe(0n);
  });

  it('refuses a tier the holder awarded themselves', () => {
    const poll = new Poll(2, 3);
    const alice = poll.admit(createPrivateState(), 1);
    const inflated = withCredential(alice, { ...alice.credential!, tier: 9n });

    expect(() => poll.enroll(inflated)).toThrow(/no credential has been issued/);
    expect(poll.ledger.enrolled).toBe(0n);
  });

  it('lets only the issuer of this poll hand out credentials', () => {
    const poll = new Poll(2, 1);
    const impostor = withIssuer(createPrivateState());
    const bob = createPrivateState();

    expect(() => poll.issue(bob, createCredential(5), impostor)).toThrow(/only this poll's issuer/);
    expect(poll.ledger.issued).toBe(0n);
  });
});

describe('state transitions', () => {
  it('moves the tally only for the option a member picked', () => {
    const poll = new Poll(3, 1);
    const members = [createPrivateState(), createPrivateState(), createPrivateState()].map((m) => poll.admit(m, 1));
    members.forEach((m) => poll.enroll(m));

    poll.vote(members[0], 0);
    poll.vote(members[1], 2);
    poll.vote(members[2], 0);

    expect(poll.counts()).toEqual([2n, 0n, 1n]);
    expect(poll.ledger.cast).toBe(3n);
    expect(poll.ledger.enrolled).toBe(3n);
  });

  it('spends one nullifier per ballot and refuses the second', () => {
    const poll = new Poll(2);
    const alice = poll.admit(createPrivateState(), 0);
    poll.enroll(alice);

    poll.vote(alice, 1);
    expect(poll.nullifiers()).toHaveLength(1);

    expect(() => poll.vote(alice, 0)).toThrow(/already voted/);
    expect(poll.counts()).toEqual([0n, 1n]);
    expect(poll.ledger.cast).toBe(1n);
  });

  it('turns away a secret that was never enrolled', () => {
    const poll = new Poll(2);
    poll.enroll(poll.admit(createPrivateState(), 0));
    const stranger = poll.admit(createPrivateState(), 0);

    expect(() => poll.vote(stranger, 0)).toThrow(/not enrolled/);
    expect(poll.ledger.cast).toBe(0n);
  });
});

describe('privacy', () => {
  it('never writes a member secret to the ledger', () => {
    const poll = new Poll(2, 1);
    const alice = poll.admit(createPrivateState(), 2);
    poll.enroll(alice);
    poll.vote(alice, 1);

    const secret = bytes(alice.secret);
    const published = [
      ...poll.nullifiers().map(bytes),
      bytes(pureCircuits.commitment(alice.secret)),
      poll.ledger.roster.root().field.toString(16),
      poll.ledger.credentials.root().field.toString(16),
    ];

    expect(published).not.toContain(secret);
    expect(published.join(' ')).not.toContain(secret);
  });

  it('publishes a nullifier that is unlinkable to the published commitment', () => {
    const poll = new Poll(2);
    const alice = poll.admit(createPrivateState(), 0);
    poll.enroll(alice);
    poll.vote(alice, 0);

    const [spent] = poll.nullifiers();
    const commitment = pureCircuits.commitment(alice.secret);

    expect(bytes(spent)).toBe(bytes(pureCircuits.nullifier(alice.secret)));
    expect(bytes(spent)).not.toBe(bytes(commitment));
  });

  it('hides which member cast which ballot', () => {
    const poll = new Poll(2, 1);
    const members = [createPrivateState(), createPrivateState(), createPrivateState()].map((m) => poll.admit(m, 1));
    members.forEach((m) => poll.enroll(m));

    poll.vote(members[0], 0);
    poll.vote(members[1], 1);
    poll.vote(members[2], 1);

    const published = poll.nullifiers().map(bytes);
    const commitments = members.map((m) => bytes(pureCircuits.commitment(m.secret)));

    for (const commitment of commitments) {
      expect(published).not.toContain(commitment);
    }
    expect(poll.counts()).toEqual([1n, 2n]);
  });

  it('hides the tier behind the blinding factor', () => {
    const poll = new Poll(2, 1);
    const member = createPrivateState();
    const credential = createCredential(7);
    poll.issue(member, credential);

    const holder = commitmentOf(member);
    const published = bytes(credentialLeafFor(holder, credential));

    const guesses = Array.from({ length: 9 }, (_, tier) => bytes(credentialLeafFor(holder, createCredential(tier))));

    expect(guesses).not.toContain(published);
    expect(published).not.toContain(bytes(credential.blind));
    expect(bytes(credentialLeafFor(holder, { ...credential, tier: 6n }))).not.toBe(published);
  });
});
