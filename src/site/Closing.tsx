import { Brand } from '../ui/Brand';
import { ChevronRight, Github } from '../ui/icons';
import { middle, REPO_URL } from '../ui/format';
import { Art } from './common';
import { NAV_LINKS } from './SiteNav';

const CONTRACT = import.meta.env.VITE_CONTRACT_ADDRESS ?? '';
const NETWORK = import.meta.env.VITE_NETWORK_ID ?? 'preprod';

export function Closing() {
  return (
    <section className="closing-wrap">
      <Art tone="ash" pos="50% 40%" className="closing" reveal={0}>
        <h2>
          Ask the question everyone is avoiding.
          <br />
          Get the answer they actually believe.
        </h2>
        <div className="hero-actions">
          <a className="btn btn-light" href="/app">
            Launch app
            <ChevronRight size={16} className="chev" />
          </a>
          <a className="btn btn-ghost" href={REPO_URL} target="_blank" rel="noreferrer">
            Read the source
          </a>
        </div>
      </Art>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Brand />
        <a className="footer-social" href={REPO_URL} target="_blank" rel="noreferrer" aria-label="Candor on GitHub">
          <Github size={18} />
        </a>
      </div>

      <nav className="footer-links" aria-label="Quick links">
        <span className="kicker">Quick links:</span>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
        <a href="/app">App</a>
      </nav>

      <div className="footer-bottom">
        <span>
          Live on Midnight <span className="cap">{NETWORK}</span>
          {CONTRACT && (
            <>
              {' · '}
              <code>{middle(CONTRACT, 8, 6)}</code>
            </>
          )}
        </span>
        <span>© 2026 Candor. MIT licensed.</span>
      </div>
    </footer>
  );
}
