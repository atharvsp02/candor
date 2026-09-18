import { CheckCircle, ChevronRight, Minus } from '../ui/icons';
import { Art, Glyph, SectionHead, reveal, type GlyphName, type Tone } from './common';

const BENEFITS: { glyph: GlyphName; tone: Tone; pos: string; title: string; body: string }[] = [
  {
    glyph: 'unlink',
    tone: 'gold',
    pos: '0% 60%',
    title: 'Unlinkable ballots',
    body: 'The contract never records which member cast which ballot, so there is nothing to leak or hand over.',
  },
  {
    glyph: 'eye',
    tone: 'gold',
    pos: '55% 30%',
    title: 'Publicly verifiable',
    body: 'Enrolments, ballots and nullifiers all live on chain. Anyone can recount the result.',
  },
  {
    glyph: 'seal',
    tone: 'gold',
    pos: '100% 80%',
    title: 'Exactly one vote each',
    body: 'A spent nullifier makes a second ballot impossible, without tying either one to a name.',
  },
];

const ROWS = [
  ['The organiser sees every answer', 'Nobody can see who voted'],
  ['Results live on a private server', 'The tally lives on a public ledger'],
  ['Duplicate votes caught on trust', 'Duplicates rejected by the contract'],
  ['Recounts are impossible', 'Anyone can recount from the chain'],
  ['Accounts and emails required', 'A wallet is all you need'],
  ['Anonymity is a promise', 'Anonymity is a proof'],
];

const STEPS: { glyph: GlyphName; pos: string; title: string; body: string }[] = [
  {
    glyph: 'wallet',
    pos: '8% 50%',
    title: 'Connect a wallet',
    body: 'Open the poll link and connect Lace or 1AM, set to Midnight Preprod.',
  },
  {
    glyph: 'key',
    pos: '50% 20%',
    title: 'Enrol once',
    body: 'Your browser creates a secret and publishes only its hash into the roster.',
  },
  {
    glyph: 'ballot',
    pos: '92% 70%',
    title: 'Vote with a proof',
    body: 'Pick an option. A zero-knowledge proof shows you are enrolled and have not voted yet.',
  },
];

export function Benefits() {
  return (
    <section className="block" id="benefits">
      <SectionHead kicker="Benefits" title="Privacy you can verify, not just trust" />
      <div className="grid-3">
        {BENEFITS.map((benefit, index) => (
          <article key={benefit.title} className="icon-card" {...reveal(index)}>
            <Art tone={benefit.tone} pos={benefit.pos} zoom="auto 240%" className="icon-card-art">
              <div className="icon-card-panel">
                <Glyph name={benefit.glyph} tone={benefit.tone} />
              </div>
            </Art>
            <div className="feature-copy">
              <h3>{benefit.title}</h3>
              <p>{benefit.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Compare() {
  return (
    <section className="block" id="compare">
      <SectionHead kicker="Comparison" title="Typical polls vs Candor" />
      <div className="compare">
        <div className="compare-col" {...reveal(0)}>
          <Art tone="sea" pos="30% 20%" zoom="220% auto" className="compare-head">
            <span>Typical polls</span>
          </Art>
          <ul>
            {ROWS.map(([before]) => (
              <li key={before}>
                <span className="x-mark">
                  <Minus size={12} />
                </span>
                {before}
              </li>
            ))}
          </ul>
        </div>
        <div className="compare-col is-ours" {...reveal(1)}>
          <Art tone="ember" pos="60% 60%" zoom="220% auto" className="compare-head">
            <span>Candor</span>
          </Art>
          <ul>
            {ROWS.map(([, after]) => (
              <li key={after}>
                <CheckCircle size={16} />
                {after}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Steps() {
  return (
    <section className="block" id="how">
      <SectionHead kicker="How it works" title="Three steps to a private ballot" />
      <div className="grid-3">
        {STEPS.map((step, index) => (
          <article key={step.title} className="icon-card" {...reveal(index)}>
            <Art tone="dusk" pos={step.pos} zoom="auto 240%" className="icon-card-art">
              <div className="icon-card-panel">
                <Glyph name={step.glyph} tone="dusk" />
              </div>
            </Art>
            <div className="feature-copy">
              <span className="kicker">Step {index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="block-cta" {...reveal(1)}>
        <a className="btn btn-light" href="/app">
          Launch app
          <ChevronRight size={16} className="chev" />
        </a>
      </div>
    </section>
  );
}
