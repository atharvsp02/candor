import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Dashboard, type DashboardProps } from '../app/Dashboard';
import { chainActivity, latestFirst } from '../app/activity';
import { NETWORK_ID, POLL_ADDRESS } from '../live/indexer';
import type { LivePoll } from '../live/useLivePoll';
import { ChevronRight } from '../ui/icons';
import { Art, Hatch } from './common';

const STAGE_WIDTH = 1180;
const STAGE_HEIGHT = 820;
const VISIBLE = 640;

const noop = () => undefined;

function Showcase({ live }: { live: LivePoll }) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.86);

  const dashboard = useMemo<DashboardProps>(
    () => ({
      status: { kind: 'disconnected' },
      tally: live.tally,
      privacy: null,
      eligibility: null,
      busy: null,
      notice: null,
      contractAddress: POLL_ADDRESS,
      networkId: NETWORK_ID,
      proverUri: '',
      shareUrl: POLL_ADDRESS ? `${window.location.origin}/app?poll=${POLL_ADDRESS}` : '',
      activity: live.events ? latestFirst(chainActivity(live.events)) : null,
      activityFailed: live.historyFailed,
      preview: true,
      onConnect: noop,
      onDisconnect: noop,
      onCreatePoll: noop,
      onIssue: noop,
      onEnrol: noop,
      onVote: noop,
      onRefresh: noop,
    }),
    [live],
  );

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
          <Dashboard {...dashboard} />
        </div>
      </div>
    </Art>
  );
}

export function Hero({ live }: { live: LivePoll }) {
  return (
    <>
      <section className="hero" id="top">
        <span className="kicker kicker-quiet">Zero-knowledge polls on Midnight</span>
        <h1>
          <span>Every vote counted.</span>
          <span>No voter revealed.</span>
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
      <Showcase live={live} />
    </>
  );
}
