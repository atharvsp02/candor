import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Dashboard } from '../app/Dashboard';
import { ChevronRight } from '../ui/icons';
import { Art, Hatch } from './common';
import { demoDashboard } from './demo';

const STAGE_WIDTH = 1180;
const STAGE_HEIGHT = 820;
const VISIBLE = 640;

function Showcase() {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.86);
  const demo = useMemo(demoDashboard, []);

  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const measure = () => setScale(element.clientWidth / STAGE_WIDTH);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Art tone="ember" pos="center 20%" className="showcase">
      <div className="showcase-window" ref={frame} style={{ height: VISIBLE * scale }}>
        <div
          className="showcase-stage"
          style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `scale(${scale})` }}
          inert
          aria-hidden="true"
        >
          <Dashboard {...demo} />
        </div>
      </div>
    </Art>
  );
}

export function Hero() {
  return (
    <>
      <section className="hero" id="top">
        <span className="kicker kicker-quiet">Zero-knowledge polls on Midnight</span>
        <h1>
          Every vote counted.
          <br />
          No voter revealed.
        </h1>
        <p className="hero-sub">
          Prove you belong, vote exactly once, and stay anonymous. Not even the poll&rsquo;s creator can see who voted.
        </p>
        <div className="hero-actions">
          <a className="btn btn-light" href="/app">
            Launch app
            <ChevronRight size={16} className="chev" />
          </a>
          <a className="btn btn-dark" href="#how">
            See how it works
          </a>
        </div>
      </section>
      <Hatch />
      <Showcase />
    </>
  );
}
