# Idea Submission — Candor

**Track:** Governance
**Idea from the list:** Private Voting — anonymous ballots with publicly verifiable tallies.
The Age / Eligibility Gate is how eligibility is enforced, so both are one contract.

**Live:** [candor-self.vercel.app](https://candor-self.vercel.app) ·
**Repo:** [github.com/atharvsp02/candor](https://github.com/atharvsp02/candor) ·
**Contract:** `f776e706de0d0567427da906901e66832bdb6ac694b3472b361b86eb43c166ac` (Preprod)

## The idea

Every anonymous vote you have ever cast was anonymous because somebody said it was. An operator holds the
responses and the dashboard, and the only thing between an answer and the name attached to it is a policy
document. People understand this, so they answer the way they are supposed to — and the result measures
what people are willing to say rather than what they think.

Candor makes a poll a deployed Compact contract. An organiser issues each eligible person a credential
carrying a tier. To enrol, you prove in zero knowledge that a credential was issued *to you* and that its
tier clears the poll's threshold, revealing neither. To vote, you prove your commitment sits somewhere in
the roster and spend a nullifier, so a second ballot is refused. The tally is a public counter anyone can
recount. The link between a voter and their ballot is never written down, so there is nothing to leak,
subpoena or sell.

## Why Midnight

On a transparent chain, every ballot is attributable to an address forever. Off-chain, an operator holds
the mapping and the guarantee is a promise again. Midnight's split between private witnesses and a public
ledger is the exact shape of this problem: the proof carries eligibility and uniqueness, the ledger
carries the count, and there is no privileged view because there is no stored link to be privileged about.

## What already works

Three circuits — `issue`, `enroll`, `vote` — compiled with Compact 0.31.1 and verified end to end on
Preprod through a browser wallet. Seventeen tests, including a privacy group that brute-forces every tier
a credential could carry to prove the blinding factor holds. CI compiles, typechecks, tests and builds on
every push. Polls are deployed from the user's own wallet, so creating a poll *is* deploying one and the
contract address is the share link.

## Who it is for

**Campus first** — student bodies, clubs and course cohorts. They run real elections and real feedback
rounds on a schedule, where everyone knows the organiser can read the responses and answers accordingly:
a course evaluation written under the lecturer's gaze, a society election counted by the outgoing
committee, a motion nobody will oppose out loud.

It is also structurally the right first market. These groups are the size where an anonymity set of a few
dozen genuinely protects someone, the organiser is a peer rather than a procurement department, and the
same person runs several polls a term — which is what turns a demo into usage.

DAO signalling votes and company engagement surveys are the same contract with a different threshold, not
separate products.

## Levels 4 to 6

**Level 4 — MVP.** Poll creation as a first-class flow: write the question and the options, set the
threshold, invite by link. Credential issuance becomes an organiser screen rather than a developer
affordance. Done when a non-technical organiser runs a poll start to finish without reading the README.

**Level 5 — Users and feedback.** Fifty Preprod respondents across at least three real campus polls, with
the feedback loop collected through Candor itself.

**Level 6 — Mainnet.** Deployment, brand assets, and twenty real onboarded users on a poll whose result
somebody actually acts on.

Full write-up: [PROPOSAL.md](PROPOSAL.md).
