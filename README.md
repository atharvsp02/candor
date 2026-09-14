# Candor

> Verifiable anonymous polling on Midnight. One member, one ballot, enforced by a zero-knowledge proof instead of a promise.

## Contract Address

| Network | Address |
|---------|---------|
| Preprod | `pending deploy` |
| Preview | `not deployed` |

## What This Does

Every "anonymous" survey you have ever filled in was anonymous because somebody told you it was. The vendor holds the responses, the admin holds the dashboard, and the only thing standing between your answer and your name is a privacy policy. People know this, so they answer the way they are supposed to, and the survey measures nothing.

Candor removes the promise and replaces it with arithmetic. A poll is a deployed contract. Members enrol by publishing a commitment to a secret that never leaves their machine. To vote, a member proves in zero knowledge that their commitment sits somewhere in the roster and that they have not voted before — without revealing which member they are. The tally moves. The link between voter and ballot is never written down, so there is nothing for an administrator to leak, subpoena, or sell.

The result is a poll where the count is publicly auditable and the voters are not.

## Privacy Model

**PUBLIC** — on the ledger, readable by anyone:

| State | Meaning |
|-------|---------|
| `roster` | Merkle tree of member commitments |
| `members` | the same commitments as a set, so nobody enrols twice |
| `spent` | nullifiers that have already been used |
| `tally` | vote count per option |
| `choices` | number of options on the ballot |
| `enrolled` / `cast` | members admitted, ballots accepted |

**PRIVATE** — witnesses, which never leave the voter's machine:

| Witness | Meaning |
|---------|---------|
| `memberSecret` | the voter's secret key |
| `memberPath` | the Merkle path that identifies the voter's leaf |

**PROVED WITHOUT REVEALING** — a voter proves that their commitment is somewhere in the roster, and that this is their first ballot, without revealing which leaf is theirs.

### Why a Merkle tree and not a set

The first version of this contract kept the roster in a `Set` and checked `roster.member(commitment)`. The compiler refused to build it without an explicit `disclose()`, which was the correct objection: looking a member up by their own commitment publishes that commitment, so an observer watching the transaction learns exactly who is voting. The anonymity would have been cosmetic.

A Merkle tree fixes this. The voter keeps the path private and discloses only the computed root, which is already public. The proof shows that *some* leaf in the tree hashes up to that root, and reveals nothing about which one. The anonymity set is every enrolled member.

### What an observer can and cannot see

An observer sees: that a ballot was cast, which option it was for, and a 32-byte nullifier.

An observer cannot see: which member cast it. The nullifier is `hash("candor:nullifier:v1", secret)` — it is stable per member, so a second ballot is rejected, but it shares no preimage with the published commitment `hash("candor:member:v1", secret)`. Linking the two requires inverting the hash.

## Tech Stack

Midnight · Compact `0.31.1` · `@midnight-ntwrk/compact-runtime` · Midnight.js `4.1.x` · TypeScript · Node.js 22 · Vitest · Docker

## Prerequisites

- Node.js 22+
- Docker (runs the proof server and the local devnet)
- The Compact toolchain:
  ```bash
  curl --proto '=https' --tlsv1.2 -LsSf \
    https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
  compact update 0.31.1
  ```
  Pin `0.31.1`. The installer's default is newer than the toolchain this project expects.

## Setup

```bash
git clone <this repo>
cd candor
npm install
npm run compile
```

`npm run compile` writes the circuits and proving/verifying keys to `managed/candor/`.

## Run Tests

```bash
npm test
```

Ten tests across three groups: circuit logic, state transitions, and privacy. The privacy group asserts the properties the product actually claims — that no member secret reaches the ledger, that the published nullifier is not the published commitment, and that no commitment appears alongside the ballots.

## Run It

Against the bundled local devnet, which needs no faucet and no wallet extension:

```bash
npm run setup
npm run cli
```

The CLI is also scriptable, which is what CI and the demo use:

```bash
npm run cli -- enrol
npm run cli -- vote 0
npm run cli -- tally
npm run cli -- demo      # enrol, vote, then read the tally
```

Against Preprod:

```bash
npm run setup -- --network preprod
npm run cli
```

The deploy pauses when the wallet needs funding; fund the printed address at the [Preprod faucet](https://midnight-tmnight-preprod.nethermind.dev/) and it continues. Set `CANDOR_OPTIONS` to change the number of options on the ballot (default 3).

## Project Layout

```
contracts/candor.compact    the contract
managed/candor/             compiled circuits and keys
src/witnesses.ts            private state and witness implementations
src/deploy.ts               deploy to local devnet, preview, or preprod
src/cli.ts                  enrol, vote, read the tally
tests/candor.test.ts        the test suite
```

## Initial Idea

Candor starts as a primitive — anonymous one-member-one-ballot polling — and grows into the product that primitive makes possible: honest internal feedback for organisations that currently cannot get it. Employee pulse surveys, DAO signalling votes, course feedback, post-incident retrospectives. All of these are places where the answer people give and the answer people hold differ, and they differ because respondents correctly assume the channel is not really anonymous. Midnight is the only place this is fixable at the infrastructure layer rather than the policy layer: the roster proves the respondent was entitled to answer, the nullifier proves they answered once, and neither the operator nor the chain ever learns who said what. The next step is a hosted frontend where creating a poll and sharing a link takes under a minute, so the cryptography is something users benefit from rather than something they have to understand.

## Screenshots

**Compile — circuits and keys generated**

![compile output](docs/compile.png)

**Deploy — contract live with an address**

![deploy output](docs/deploy.png)
