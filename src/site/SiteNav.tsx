import { useEffect, useState } from 'react';
import { Brand } from '../ui/Brand';
import { ChevronRight, Close, Menu } from '../ui/icons';

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#how', label: 'How it works' },
  { href: '#privacy', label: 'Privacy' },
  { href: '#faq', label: 'FAQs' },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  return (
    <header className={['site-nav', open && 'is-open', scrolled && 'is-scrolled'].filter(Boolean).join(' ')}>
      <div className="nav-inner">
        <Brand />

        <nav className="nav-links" aria-label="Sections">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <a className="btn btn-dark nav-cta" href="/app">
          Launch app
        </a>

        <button
          className="nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <Close size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div id="nav-menu" className="nav-menu" hidden={!open}>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
        <a className="btn btn-light" href="/app">
          Launch app
          <ChevronRight size={16} className="chev" />
        </a>
      </div>
    </header>
  );
}
