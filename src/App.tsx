import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';
import { PrivacyProof } from './components/PrivacyProof';
import { Hero, LiveStats } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { useMemo } from 'react';
import { useMidnight } from './hooks/useMidnight';
import { privacyView, tallyView } from './view';
import './App.css';

const REPO_URL = 'https://github.com/atharvsp02/candor';

export default function App() {
  const m = useMidnight();
  const connected = m.status.kind === 'connected';
  const hasPoll = Boolean(m.contractAddress);
  const tally = useMemo(() => tallyView(m.tally), [m.tally]);
  const privacy = useMemo(() => privacyView(m.privacy), [m.privacy]);

  return (
    <div className="page">

      <nav className="nav">
        <a className="brand" href="#top">
          <svg className="brand-mark" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="brand" x1="0" y1="0" x2="26" y2="26">
                <stop offset="0" stopColor="#2f6bff" />
                <stop offset="1" stopColor="#e0147c" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width="24" height="24" rx="7" stroke="url(#brand)" strokeWidth="1.6" />
            <circle cx="13" cy="8.5" r="2.3" fill="url(#brand)" />
            <circle cx="8" cy="17" r="2.3" fill="url(#brand)" />
            <circle cx="18" cy="17" r="2.3" fill="url(#brand)" />
            <path d="M13 10.8 L8.6 15 M13 10.8 L17.4 15" stroke="url(#brand)" strokeWidth="1.4" />
          </svg>
          Candor
        </a>

        <div className="nav-links">
          <a href="#poll">Vote</a>
          <a href="#how">How it works</a>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>

        <div className="nav-end">
          <WalletConnect status={m.status} onConnect={m.connect} onDisconnect={m.disconnect} />
        </div>
      </nav>

      <main id="top">
        <Hero hasPoll={hasPoll} />
        <LiveStats tally={tally} />

        <section className="section" id="poll">
          <div className="section-head">
            <span className="kicker">The poll</span>
            <h2>Cast a ballot nobody can trace.</h2>
            <p>Connect a Midnight wallet, enrol once, and vote. Your browser proves you are eligible without saying who you are.</p>
          </div>

          <div className="app-grid">
            <CircuitCall
              connected={connected}
              hasPoll={hasPoll}
              shareUrl={m.shareUrl}
              onCreatePoll={m.createPoll}
              tally={tally}
              busy={m.busy}
              notice={m.notice}
              onEnrol={m.enrol}
              onVote={m.vote}
            />
            <PrivacyProof privacy={privacy} />
          </div>
        </section>

        <HowItWorks />
      </main>

      <footer className="footer">
        <dl>
          <dt>Contract</dt>
          <dd>
            <code>{m.contractAddress || 'not configured'}</code>
          </dd>
          <dt>Network</dt>
          <dd>
            <code>{m.networkId}</code>
          </dd>
          {m.proverUri && (
            <>
              <dt>Proving at</dt>
              <dd>
                <code>{m.proverUri}</code>
              </dd>
            </>
          )}
        </dl>
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          Source on GitHub →
        </a>
      </footer>
    </div>
  );
}
