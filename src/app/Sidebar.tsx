import { useState } from 'react';
import { Brand } from '../ui/Brand';
import { Ballot, Book, ChevronRight, Code, Grid, Home, Layers, Plus, Shield } from '../ui/icons';
import { CONTRACT_SOURCE_URL, REPO_URL } from '../ui/format';

const SECTIONS = [
  { href: '#overview', label: 'Overview', icon: Grid },
  { href: '#ballot', label: 'Ballot', icon: Ballot },
  { href: '#privacy', label: 'Privacy', icon: Shield },
  { href: '#details', label: 'Poll details', icon: Layers },
];

const RESOURCES = [
  { href: '/', label: 'Landing page', icon: Home, external: false },
  { href: CONTRACT_SOURCE_URL, label: 'Contract source', icon: Code, external: true },
  { href: `${REPO_URL}#readme`, label: 'Documentation', icon: Book, external: true },
];

type Props = {
  connected: boolean;
  busy: string | null;
  onCreatePoll: () => void;
};

export function Sidebar({ connected, busy, onCreatePoll }: Props) {
  const [active, setActive] = useState(SECTIONS[0].href);

  return (
    <aside className="dash-side">
      <div className="side-brand">
        <Brand href="/" size={26} />
      </div>

      <nav className="side-nav" aria-label="Poll">
        <span className="side-label">Poll</span>
        {SECTIONS.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className={active === href ? 'side-link is-active' : 'side-link'}
            onClick={() => setActive(href)}
          >
            <Icon size={16} />
            <span>{label}</span>
            {active === href && <ChevronRight size={14} className="side-chevron" />}
          </a>
        ))}

        <span className="side-label">Resources</span>
        {RESOURCES.map(({ href, label, icon: Icon, external }) => (
          <a
            key={href}
            href={href}
            className="side-link"
            {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            <Icon size={16} />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="side-card">
        <strong>Start a new poll</strong>
        <p>Deploys a fresh ballot contract through your wallet.</p>
        <button className="btn btn-dark btn-sm btn-block" onClick={onCreatePoll} disabled={!connected || busy !== null}>
          <Plus size={14} />
          {busy === 'Poll creation' ? 'Deploying…' : 'New poll'}
        </button>
      </div>
    </aside>
  );
}
