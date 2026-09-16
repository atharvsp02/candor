import type { Tally } from '../hooks/useMidnight';

type Props = {
  tally: Tally | null;
  hasPoll: boolean;
};

export function Hero({ tally, hasPoll }: Props) {
  return (
    <section className="hero">
      <p className="hero-word" aria-hidden="true">
        Unlinkable
      </p>

      <div className="stage" aria-hidden="true">
        <div className="stage-glow" />
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
        <span className="orb orb-4" />
        <div className="ballot">
          <svg viewBox="0 0 120 150" fill="none">
            <defs>
              <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#b6ffd9" stopOpacity="0.9" />
                <stop offset="1" stopColor="#22f2ef" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <g stroke="url(#edge)" strokeWidth="1.1" strokeLinecap="round">
              <path d="M60 22 L32 56 M60 22 L88 56" />
              <path d="M32 56 L18 92 M32 56 L46 92 M88 56 L74 92 M88 56 L102 92" />
            </g>
            <g fill="#04201a" stroke="url(#edge)" strokeWidth="1.2">
              <circle cx="60" cy="22" r="7" />
              <circle cx="32" cy="56" r="6" />
              <circle cx="88" cy="56" r="6" />
              <circle cx="18" cy="92" r="5" />
              <circle cx="46" cy="92" r="5" />
              <circle cx="74" cy="92" r="5" />
              <circle cx="102" cy="92" r="5" />
            </g>
            <circle cx="46" cy="92" r="5" fill="#3ee97d" />
            <path d="M54 124 l6 6 l12 -14" stroke="#b6ffd9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="ballot-chip" />
        </div>
        <div className="pedestal">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="hero-copy">
        <p className="eyebrow glass">
          <span className="dot dot-live" />
          Live on Midnight Preprod
        </p>
        <h1>
          Votes
          <br />
          without voters
        </h1>
        <p>
          Anonymous polls where the anonymity is proven, not promised. One member, one ballot — enforced by a
          zero-knowledge proof, so nobody can ever link a vote to a person.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#poll">
            {hasPoll ? 'Cast your vote' : 'Create a poll'}
          </a>
          <a className="btn btn-glass" href="#how">
            How it works
          </a>
        </div>
      </div>

      <aside className="stat-card glass">
        <h2>This poll, on chain</h2>
        <p>Read live from the Midnight ledger</p>
        <div className="stat-row">
          <span>Members enrolled</span>
          <strong>{tally ? tally.enrolled.toString() : '—'}</strong>
        </div>
        <div className="stat-row">
          <span>Ballots cast</span>
          <strong>{tally ? tally.cast.toString() : '—'}</strong>
        </div>
        <div className="stat-row">
          <span>Voters identified</span>
          <strong>0</strong>
        </div>
        <span className="stat-live">
          <span className="dot dot-live" />
          verifiable by anyone
        </span>
      </aside>

      <a className="scroll-hint" href="#poll">
        <span />
        Scroll to vote
      </a>
    </section>
  );
}
