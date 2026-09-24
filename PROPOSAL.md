# Product Proposal — Candor

**Idea from the provided list:** Private Voting — anonymous ballots with publicly verifiable tallies.

**Repository:** https://github.com/atharvsp02/candor ·
**Live:** [candor-self.vercel.app](https://candor-self.vercel.app) ·
**Contract:** `815ed0190cbdb7889c490cff10a3f5451ac096d3b702c08ae1a71200db2c5f31` (Preprod)

---

## The problem

Every "anonymous" survey is anonymous because somebody says it is. A vendor holds the responses, an
administrator holds the dashboard, and the only thing between an answer and the name attached to it is a
policy document. The person answering knows this, so they answer the way they are supposed to. The
organisation then makes decisions on the difference between what people said and what people think.

This is not a tooling gap. Culture Amp, Officevibe, Google Forms and every DAO snapshot tool are all
competent software. The flaw is structural: somebody is technically capable of deanonymising the
respondent, and that somebody usually works for the person asking the question. No feature fixes that,
because the feature would have to be "we promise harder".

Two consequences are worth naming, because they are what a buyer actually feels:

1. **Engagement surveys measure compliance, not sentiment.** The signal an organisation pays for is the
   one it is least likely to receive.
2. **Results are unauditable in the other direction too.** A respondent who distrusts the tally has no
   way to check it, and an operator who wants to quietly drop inconvenient responses faces nothing but
   their own conscience.

An anonymous system that nobody can audit and an auditable system that nobody can trust are the two
halves of the same failure. Private Voting on Midnight is the first place both halves close at once.

## What Candor is

A poll is a deployed Compact contract. Three parties interact with it and none of them can break the
others' guarantees.

| Party | Can do | Cannot do |
|---|---|---|
| **Organiser** | Create a poll, set the eligibility threshold, issue credentials, read the tally | Learn who voted, or how anyone voted |
| **Respondent** | Prove eligibility, enrol, cast one ballot | Vote twice, or vote without a credential |
| **Anyone** | Read the tally, the roster size and the number of ballots, and verify the count | Link a ballot to a member, or read anyone's tier |

The tally is a public counter on the ledger. Anybody can recompute it from the chain. Nobody — including
the organiser, including the person who deployed the contract, including whoever later acquires the
company — can determine which enrolled member produced any given ballot, because the link was never
recorded.

### How the privacy model does the work

Candor uses all three parts of Midnight's disclosure model, and each one carries weight:

**Private state (witnesses)** — the member's 32-byte secret, the tier their credential grants, the
blinding factor that hides it, and the Merkle paths to their credential and roster leaves. None of these
are ever transmitted. The Merkle path in particular is the value that would say *which* leaf is theirs,
which is exactly why it is a witness and not an argument.

**Zero-knowledge circuits** — three of them:

- `issue` proves the caller knows the preimage of the poll's issuer hash, so eligibility cannot be
  self-minted.
- `enroll` proves a credential exists in the credential tree, that it was issued to *this* member's
  commitment, and that its tier clears `minTier` — revealing neither the tier nor which credential it is.
- `vote` proves the caller's commitment is somewhere in the roster and that their nullifier is unspent —
  revealing neither which member they are nor anything that links back to enrolment.

**Public ledger (`disclose`)** — the credential root, the roster root, spent nullifiers, and the tally.
Everything disclosed is either a value that was already public or a value whose preimage is unrecoverable.
The one place `disclose()` carries real weight is the Merkle root at vote time, and it is disclosing a
number that every member already knows.

### What an observer can and cannot learn

| An observer sees | An observer cannot tell |
|---|---|
| A credential was issued (a 32-byte hash) | Who it was issued to, or what tier it grants |
| Someone eligible enrolled | Which credential they used, or how far above the threshold they were |
| A ballot was cast, and for which option | Which of the enrolled members cast it |
| The running totals: issued, enrolled, cast | Any link between a credential, a commitment and a nullifier |

The blinding factor is the non-obvious part. Tiers are small numbers, so `hash(holder, tier)` alone could
be brute-forced by trying all eight. `hash(holder, tier, blind)` cannot, and the test suite asserts it by
attempting exactly that attack.

## Who it is for

**Beachhead: 50–500 person companies running quarterly engagement surveys.** They are large enough that
respondents genuinely fear attribution and small enough that a single leaked comment is traceable by
writing style. They already pay for a survey tool, so the budget line exists — the purchase is a switch,
not a new category. Crucially, the buyer (People Ops) and the sceptic (the employee) are different people,
and Candor is the rare product that can satisfy both without asking either to take the other's word.

**Second market: DAOs and token communities running signalling votes.** On-chain governance today is
pseudonymous at best — wallet addresses are stable identifiers, so a whale's vote is visible, and smaller
holders vote with the crowd rather than against it. An eligibility gate on stake tier plus an anonymous
ballot is a direct fix, and this audience already understands why it matters.

**Adjacent, later: course evaluations, post-incident retrospectives, board confidence votes, clinical and
academic surveys.** Same shape, longer sales cycles.

## Why Midnight

The product is impossible to build honestly anywhere else.

On a transparent chain, every ballot is attributable to an address forever. Off-chain, an operator holds
the link and the guarantee is a promise again. Mixers and commit–reveal schemes address one half and break
the other: either the tally stops being publicly verifiable, or a coordinator learns the mapping.

Midnight's split between private witnesses and a public ledger is the exact shape this problem has. The
proof carries the eligibility and uniqueness properties; the ledger carries the count. Neither needs a
trusted party, and there is no privileged view to be subpoenaed, sold, or breached — because there is no
stored link to be privileged about.

## Status

Built and running on Preprod today:

- Three circuits compiled with Compact `0.31.1`; credential issuance, gated enrolment, and one-ballot-per-member voting all verified end to end on Preprod through a browser wallet.
- A production web app — landing page and poll dashboard — reading live contract state from the public indexer.
- 17 tests across four groups, including a privacy group that asserts the anonymity and tier-hiding properties directly, so a change that quietly breaks them fails the suite instead of shipping.
- CI on every push: compile, typecheck, test, build.
- Polls are deployed from the browser through the user's own wallet, so creating a poll is a user action rather than an operator script, and the contract address is the share link.

## Scope for the remaining levels

| Level | Deliverable | Definition of done |
|---|---|---|
| **4 — MVP live** | Poll creation as a first-class flow: name the question, write the options, set the threshold, invite by link. Issuance moves from a developer affordance to an organiser screen. | A non-technical organiser runs a real poll start to finish without reading the README. |
| **5 — Users & feedback** | 50 Preprod respondents across at least three real polls, plus an in-app feedback loop and written documentation. | Feedback is collected through Candor itself, which is the strongest possible demonstration. |
| **6 — Mainnet** | Mainnet deployment, brand assets, 20 onboarded real users. | A poll someone outside the program depends on the result of. |

Deliberately out of scope for now: ranked-choice and weighted ballots, results embargoed until a closing
time, credential revocation, and organisation-level accounts. Each is a real requirement for a paid
product and each is a distraction from proving the core claim first.

## Risks, and what is being done about them

| Risk | Mitigation |
|---|---|
| **Proving is slow enough to hurt the experience.** Enrolling and voting each take tens of seconds. | Honest progress states that say what is being proved rather than a generic spinner. Measured at every level; if it becomes the reason people abandon, it becomes the level's priority. |
| **Wallet installation is a real drop-off.** A respondent who must install an extension to answer a survey often will not. | The eligibility gate already separates issuance from enrolment, so a lighter respondent path is a design change rather than a contract change. |
| **"Trust us, it is anonymous" is the claim the product exists to refute — and users cannot read circuits.** | The app shows each user exactly what the chain holds about them, read back live from the chain, with the redacted rows redacted because there is genuinely nothing to fetch. Verifiability is a screen, not a whitepaper. |
| **Small polls have small anonymity sets.** With three respondents, anonymity is thin regardless of the cryptography. | The anonymity set size is displayed rather than hidden, and a future release will warn an organiser before they open a poll too small to protect anyone. |

## The measure of success

Not signups. The question is whether an organisation runs the same survey through an incumbent tool and
through Candor, and gets materially different answers.

If the answers match, the privacy was never the binding constraint and the product is a curiosity. If
they diverge, then every engagement survey ever run was measuring something other than what it claimed to,
and there is a company here.
