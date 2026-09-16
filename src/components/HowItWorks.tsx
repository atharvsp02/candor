const STEPS = [
  {
    title: 'Enrol with a secret',
    body: 'Your browser generates a secret and publishes only a hash of it into the roster. The secret itself never leaves your machine.',
    code: 'hash("candor:member:v1", secret)',
  },
  {
    title: 'Prove you belong',
    body: 'To vote, you prove your hash is somewhere in the Merkle tree — without revealing which leaf. Every member looks identical.',
    code: 'merkleTreePathRoot(path)',
  },
  {
    title: 'Vote exactly once',
    body: 'Each ballot spends a nullifier derived from your secret. A second vote is rejected by the contract, and the nullifier cannot be traced back to you.',
    code: 'hash("candor:nullifier:v1", secret)',
  },
];

export function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="section-head">
        <span className="kicker">How it works</span>
        <h2>The count is public. The voters are not.</h2>
        <p>
          Anonymous surveys usually ask you to trust whoever runs them. Candor removes that trust — the link between a
          person and their ballot is never written down, so there is nothing to leak.
        </p>
      </div>

      <div className="how-grid">
        {STEPS.map((step, index) => (
          <article key={step.title} className="how-card glass">
            <span className="how-num">0{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <code>{step.code}</code>
          </article>
        ))}
      </div>
    </section>
  );
}
