import { describe, expect, it } from 'vitest';
import {
  createCircuitContext,
  createConstructorContext,
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, pureCircuits } from '../managed/candor/contract/index.js';
import { createPrivateState, witnesses, type CandorPrivateState } from '../src/witnesses.js';

const COIN_PUBLIC_KEY = '0'.repeat(64);

class Poll {
  private readonly contract = new Contract(witnesses);
  private readonly address = sampleContractAddress();
  private state: unknown;

  constructor(optionCount: number, seed: CandorPrivateState = createPrivateState()) {
    const { currentContractState } = this.contract.initialState(
      createConstructorContext(seed, COIN_PUBLIC_KEY),
      BigInt(optionCount),
    );
    this.state = currentContractState;
  }

  get ledger() {
    return ledger((this.state as any).data ?? this.state);
  }

  enroll(member: CandorPrivateState): Uint8Array {
    const context = createCircuitContext(this.address, COIN_PUBLIC_KEY, this.state as any, member);
    const { result, context: next } = this.contract.impureCircuits.enroll(context);
    this.state = next.currentQueryContext.state;
    return result;
  }

  vote(member: CandorPrivateState, choice: number): void {
    const context = createCircuitContext(this.address, COIN_PUBLIC_KEY, this.state as any, member);
    const { context: next } = this.contract.impureCircuits.vote(context, BigInt(choice));
    this.state = next.currentQueryContext.state;
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
    const alice = createPrivateState();

    const leaf = poll.enroll(alice);

    expect(bytes(leaf)).toBe(bytes(pureCircuits.commitment(alice.secret)));
    expect(poll.ledger.enrolled).toBe(1n);
    expect(poll.ledger.roster.findPathForLeaf(leaf)).toBeDefined();
  });

  it('admits a member once, however many times they ask', () => {
    const poll = new Poll(2);
    const alice = createPrivateState();
    poll.enroll(alice);

    expect(() => poll.enroll(alice)).toThrow(/already enrolled/);
    expect(poll.ledger.enrolled).toBe(1n);
  });

  it('refuses a ballot for an option that is not on it', () => {
    const poll = new Poll(2);
    const alice = createPrivateState();
    poll.enroll(alice);

    expect(() => poll.vote(alice, 2)).toThrow(/not on the ballot/);
    expect(poll.ledger.cast).toBe(0n);
  });
});

describe('state transitions', () => {
  it('moves the tally only for the option a member picked', () => {
    const poll = new Poll(3);
    const [alice, bob, carol] = [createPrivateState(), createPrivateState(), createPrivateState()];
    [alice, bob, carol].forEach((m) => poll.enroll(m));

    poll.vote(alice, 0);
    poll.vote(bob, 2);
    poll.vote(carol, 0);

    expect(poll.counts()).toEqual([2n, 0n, 1n]);
    expect(poll.ledger.cast).toBe(3n);
    expect(poll.ledger.enrolled).toBe(3n);
  });

  it('spends one nullifier per ballot and refuses the second', () => {
    const poll = new Poll(2);
    const alice = createPrivateState();
    poll.enroll(alice);

    poll.vote(alice, 1);
    expect(poll.nullifiers()).toHaveLength(1);

    expect(() => poll.vote(alice, 0)).toThrow(/already voted/);
    expect(poll.counts()).toEqual([0n, 1n]);
    expect(poll.ledger.cast).toBe(1n);
  });

  it('turns away a secret that was never enrolled', () => {
    const poll = new Poll(2);
    poll.enroll(createPrivateState());
    const stranger = createPrivateState();

    expect(() => poll.vote(stranger, 0)).toThrow(/not enrolled/);
    expect(poll.ledger.cast).toBe(0n);
  });
});

describe('privacy', () => {
  it('never writes a member secret to the ledger', () => {
    const poll = new Poll(2);
    const alice = createPrivateState();
    poll.enroll(alice);
    poll.vote(alice, 1);

    const secret = bytes(alice.secret);
    const published = [
      ...poll.nullifiers().map(bytes),
      bytes(pureCircuits.commitment(alice.secret)),
      poll.ledger.roster.root().field.toString(16),
    ];

    expect(published).not.toContain(secret);
    expect(published.join(' ')).not.toContain(secret);
  });

  it('publishes a nullifier that is unlinkable to the published commitment', () => {
    const poll = new Poll(2);
    const alice = createPrivateState();
    poll.enroll(alice);
    poll.vote(alice, 0);

    const [spent] = poll.nullifiers();
    const commitment = pureCircuits.commitment(alice.secret);

    expect(bytes(spent)).toBe(bytes(pureCircuits.nullifier(alice.secret)));
    expect(bytes(spent)).not.toBe(bytes(commitment));
  });

  it('hides which member cast which ballot', () => {
    const poll = new Poll(2);
    const members = [createPrivateState(), createPrivateState(), createPrivateState()];
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
});
