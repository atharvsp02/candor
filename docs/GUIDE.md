# Using Candor

Two guides: one for whoever runs a poll, one for everyone voting in it. Neither needs you to know how the
cryptography works.

You need a Midnight wallet — [1AM](https://chromewebstore.google.com/detail/1am/bphnkdkcnfhompoegfpgnkidcjfbojjp)
or [Lace](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk) — set to Preprod,
with some tNIGHT from the [faucet](https://faucet.preprod.midnight.network).

---

## Running a poll

### 1. Create it

Open [candor-self.vercel.app/app](https://candor-self.vercel.app/app), connect your wallet, and choose
**New poll** in the sidebar.

- **Question** — what you are asking. It is published, so anyone with the link can read it.
- **Options** — between two and eight. Leave Yes / No / Abstain, or write your own.
- **Eligibility threshold** — the tier a member's credential must reach to vote. Leave it at 1 if everyone
  you invite should be able to vote.

Choose **Deploy poll** and approve in your wallet. Deploying takes about a minute. When it finishes, the
address bar holds your poll's link.

**Use the same browser for everything that follows.** The key that lets you hand out credentials is kept
in this browser and nowhere else. If you clear its site data, you can still read the poll, but you can no
longer admit anyone new to it.

### 2. Invite people

Send them the poll link — **Copy invite** on the Overview does it. Ask each person to open it, connect a
wallet, go to **Members**, and send you their **member code**.

### 3. Give each person a credential

In **Members**, under **Issue a credential**:

1. Paste the member code they sent you.
2. Set their tier. The card warns you if it is below your threshold.
3. Choose **Issue credential** and approve in your wallet.

A **credential link** appears. Send it back to that person — privately, the same way they sent you their
code. Repeat for each member.

### 4. Watch the result

The tally on the Overview updates as ballots land. It is read straight from the chain, so anyone with the
link sees the same numbers you do.

What you will **not** see, at any point, is who voted for what. That is not a setting you can turn off.
There is nothing recorded that would let you, or anyone else, work it out.

---

## Voting in a poll

### 1. Open the poll and send your code

Open the link you were given and connect your wallet. Go to **Members** and choose **Copy code**. Send that
code to the person running the poll.

The code is safe to share. It is not your wallet address, and it does not say who you are.

### 2. Open your credential link

The organiser sends you a credential link. **Open it in the same browser you copied your code from.** Your
credential only works alongside the code you sent, and that code lives in this browser.

### 3. Enrol

Go to **Ballot**. Your credential shows as issued. Choose **Enrol** and approve in your wallet. This proves
you are allowed to vote without revealing your tier, and takes around a minute.

### 4. Vote

Pick an option and choose **Prove and vote**. Approve in your wallet. When it reads **Ballot counted**,
you are done.

You can vote once. A second attempt is refused by the contract itself, not by the app.

---

## If something goes wrong

**"The wallet's prover did not answer. Trying once more…"** — the wallet's proving service was slow to
respond. Candor retries once on its own. If it fails twice, wait a minute and try again.

**The credential shows "not on chain".** You opened the credential link in a different browser from the
one you copied your code from, or the organiser pasted a different code. Send your code again from the
browser you want to vote in.

**The Issue credential card is missing.** You are not in the browser that created the poll. Only that
browser holds the key to admit new members.

**"This credential is below the poll's threshold."** The organiser issued you a lower tier than the poll
requires. Ask them to issue a new credential.

**Nothing happens when you approve.** Your wallet may be out of DUST, which pays for transactions. In
Lace, NIGHT has to be designated before it generates DUST — holding it is not enough.

---

## What each person can see

| | Organiser | Voter | Anyone with the link |
|---|---|---|---|
| The question and options | ✓ | ✓ | ✓ |
| The running tally | ✓ | ✓ | ✓ |
| How many are enrolled and have voted | ✓ | ✓ | ✓ |
| Each member's tier | only the ones they issued | only their own | ✗ |
| Who voted for what | ✗ | only their own ballot | ✗ |
