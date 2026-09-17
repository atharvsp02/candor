import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import type { TallyView } from '../view';

const TrackScene = lazy(() => import('./TrackScene'));

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const REDUCED = '(prefers-reduced-motion: reduce)';
const STACKED = '(max-width: 900px)';

const useMedia = (query: string) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);

  return matches;
};

type HeroProps = {
  hasPoll: boolean;
};

export function Hero({ hasPoll }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(true);
  const reduced = useMedia(REDUCED);
  const stacked = useMedia(STACKED);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.02 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero" ref={ref}>
      <div className="hero-scene" aria-hidden="true">
        <SceneBoundary>
          <Suspense fallback={null}>
            <TrackScene active={active} reducedMotion={reduced} close={stacked} />
          </Suspense>
        </SceneBoundary>
      </div>

      <div className="hero-copy">
        <p className="eyebrow">
          <span className="dot dot-live" />
          Live on Midnight Preprod
        </p>
        <h1>
          Votes without
          <br />
          voters
        </h1>
        <p className="hero-sub">
          Anonymous polls where the anonymity is proven, not promised. One member, one ballot — and nobody, not even the
          poll&rsquo;s creator, can link a vote to a person.
        </p>
        <div className="hero-actions">
          <a className="btn btn-accent" href="#poll">
            {hasPoll ? 'Cast your vote' : 'Create a poll'}
          </a>
          <a className="btn btn-outline" href="#how">
            How it works
          </a>
        </div>
      </div>

      <ol className="hero-legend" aria-label="What the animation shows">
        <li>
          <i className="legend-dot legend-id" />
          Voters roll in identifiable
        </li>
        <li>
          <i className="legend-dot legend-gate" />
          A zero-knowledge proof
        </li>
        <li>
          <i className="legend-dot legend-anon" />
          Ballots roll out identical
        </li>
      </ol>
    </section>
  );
}

type StatsProps = {
  tally: TallyView | null;
};

export function LiveStats({ tally }: StatsProps) {
  const value = (n: number | undefined) => (n === undefined ? '—' : String(n));

  return (
    <section className="stats" aria-label="This poll, read live from the ledger">
      <div className="stat">
        <strong>{value(tally?.enrolled)}</strong>
        <span>members enrolled</span>
      </div>
      <div className="stat">
        <strong>{value(tally?.cast)}</strong>
        <span>ballots cast</span>
      </div>
      <div className="stat">
        <strong>0</strong>
        <span>voters identified</span>
      </div>
      <p className="stats-note">
        <span className="dot dot-live" />
        Read live from the Midnight ledger — verifiable by anyone
      </p>
    </section>
  );
}
