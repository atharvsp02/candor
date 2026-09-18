import type { ReactNode } from 'react';
import type { TallyView } from '../view';
import type { ChainEvent } from '../live/indexer';
import { NETWORK_ID } from '../live/indexer';
import type { LivePoll } from '../live/useLivePoll';
import { EVENT_TITLES } from '../app/activity';
import { Ballot, Check, Cpu, Key, Plus, Users, Wallet } from '../ui/icons';
import { middle, optionLabel, OPTION_COLORS, percent, ROSTER_CAPACITY, titleCase, when } from '../ui/format';
import { Art, SectionHead, type Tone } from './common';

type FeatureProps = {
  tone: Tone;
  pos: string;
  title: string;
  body: string;
  wide?: boolean;
  children: ReactNode;
};

function Feature({ tone, pos, title, body, wide, children }: FeatureProps) {
  return (
    <article className={wide ? 'feature feature-wide' : 'feature'}>
      <Art tone={tone} pos={pos} zoom="auto 260%" className="feature-art">
        <div className="mini">{children}</div>
      </Art>
      <div className="feature-copy">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </article>
  );
}

const LiveChip = () => (
  <span className="mini-chip">
    <span className="dot dot-live" />
    Live · {titleCase(NETWORK_ID)}
  </span>
);

const show = (value: number | undefined) => (value === undefined ? '—' : value.toLocaleString());

function TallyMini({ tally }: { tally: TallyView | null }) {
  const counts = tally?.counts ?? [0, 0, 0];
  const most = Math.max(...counts);
  const leader = most > 0 ? counts.indexOf(most) : -1;

  return (
    <>
      <div className="mini-head">
        <div>
          <span className="mini-label">Ballots cast</span>
          <strong className="mini-value">
            {show(tally?.cast)}
            {tally && <span className="tag tag-green">{percent(tally.cast, tally.enrolled)}% turnout</span>}
          </strong>
        </div>
        <LiveChip />
      </div>
      <div className="mini-seg">
        {counts.map((_, index) => (
          <span key={index} className={index === leader ? 'is-on' : undefined}>
            {optionLabel(index)}
          </span>
        ))}
      </div>
      <div className="mini-bars" role="img" aria-label={counts.map((c, i) => `${optionLabel(i)} ${c}`).join(', ')}>
        {counts.map((count, index) => (
          <div key={index}>
            <i
              style={{
                height: Math.max(2, Math.round((count * 34) / Math.max(1, most))),
                background: OPTION_COLORS[index],
              }}
            />
            <span>{tally ? count : '—'}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function RosterMini({ tally }: { tally: TallyView | null }) {
  const split = [
    { label: 'Enrolled', value: tally?.enrolled, width: tally?.enrolled ? 100 : 0 },
    { label: 'Voted', value: tally?.cast, width: tally ? percent(tally.cast, tally.enrolled) : 0 },
    { label: 'Linked', value: tally ? 0 : undefined, width: 0 },
  ];

  return (
    <>
      <div className="mini-head">
        <div>
          <span className="mini-label">Roster</span>
          <strong className="mini-value">
            {show(tally?.enrolled)}
            <span className="tag">of {ROSTER_CAPACITY.toLocaleString()} seats</span>
          </strong>
        </div>
        <span className="mini-chip">Merkle depth 10</span>
      </div>
      <div className="mini-split">
        {split.map((item, index) => (
          <div key={item.label}>
            <span className="mini-label">{item.label}</span>
            <strong>{show(item.value)}</strong>
            <i style={{ width: `${item.width}%`, background: OPTION_COLORS[index] }} />
          </div>
        ))}
      </div>
    </>
  );
}

const EVENT_ICONS = { deploy: Plus, enroll: Users, vote: Check, update: Ballot };

function HistoryMini({ events, failed }: { events: readonly ChainEvent[] | null; failed: boolean }) {
  if (!events) {
    return (
      <p className="mini-empty">
        {failed ? (
          'The ledger could not be reached just now.'
        ) : (
          <>
            <span className="spinner" />
            Reading the poll’s history from the ledger…
          </>
        )}
      </p>
    );
  }

  if (events.length === 0) return <p className="mini-empty">Nothing has happened on this poll yet.</p>;

  return (
    <ul className="mini-events">
      {[...events]
        .reverse()
        .slice(0, 3)
        .map((event) => {
          const Icon = EVENT_ICONS[event.kind];
          return (
            <li key={event.hash} className={`ev ev-${event.kind === 'vote' ? 'ok' : 'info'}`}>
              <span className="ev-icon">
                <Icon size={13} />
              </span>
              <div>
                <strong>{EVENT_TITLES[event.kind]}</strong>
                <span>
                  block {event.height.toLocaleString()} · tx {middle(event.hash, 6, 4)}
                </span>
              </div>
              <time dateTime={event.at.toISOString()} title={event.at.toLocaleString()}>
                {when(event.at)}
              </time>
            </li>
          );
        })}
    </ul>
  );
}

const CIRCUITS = [
  { name: 'enroll', args: '()', kind: 'impure', result: 'roster.insert(leaf)', note: '+1 member' },
  { name: 'vote', args: '(choice)', kind: 'impure', result: 'spent.insert(tag)', note: '+1 ballot' },
  { name: 'commitment', args: '(sk)', kind: 'pure', result: 'persistentHash', note: 'member:v1' },
  { name: 'nullifier', args: '(sk)', kind: 'pure', result: 'persistentHash', note: 'nullifier:v1' },
  { name: 'checkRoot', args: '(root)', kind: 'ledger', result: 'MerkleTree<10>', note: 'depth 10' },
];

function CircuitsMini() {
  return (
    <ul className="mini-rows">
      {CIRCUITS.map((circuit, index) => (
        <li key={circuit.name}>
          <span className="row-dot" style={{ background: OPTION_COLORS[index] }} />
          <span className="row-name">
            {circuit.name}
            <em>{circuit.args}</em>
          </span>
          <code className="row-mid">{circuit.result}</code>
          <span className={circuit.kind === 'pure' ? 'row-note is-pure' : 'row-note'}>{circuit.note}</span>
        </li>
      ))}
    </ul>
  );
}

const WALLETS = [
  { name: 'Lace', detail: 'browser extension', icon: Wallet, status: 'Supported' },
  { name: '1AM', detail: 'browser extension', icon: Key, status: 'Supported' },
  { name: 'DApp Connector API', detail: 'version 4', icon: Cpu, status: 'Required' },
  { name: 'Proof server', detail: 'wallet default or local', icon: Cpu, status: 'Optional' },
];

function WalletsMini() {
  return (
    <ul className="mini-rows">
      {WALLETS.map(({ name, detail, icon: Icon, status }) => (
        <li key={name}>
          <span className="row-icon">
            <Icon size={14} />
          </span>
          <span className="row-name">{name}</span>
          <span className="row-mid row-muted">{detail}</span>
          <span className="row-pill">{status}</span>
        </li>
      ))}
    </ul>
  );
}

export function Features({ live }: { live: LivePoll }) {
  return (
    <section className="block" id="features">
      <SectionHead kicker="Solution" title="One member. One ballot. Zero trace." />
      <div className="features">
        <Feature
          tone="sea"
          pos="10% 40%"
          title="Live, recountable tally"
          body="Read straight from the Midnight ledger as ballots land, so anyone can check the count themselves."
        >
          <TallyMini tally={live.tally} />
        </Feature>
        <Feature
          tone="sea"
          pos="70% 60%"
          title="Membership without names"
          body="Voters prove they sit somewhere in the roster without revealing which entry is theirs."
        >
          <RosterMini tally={live.tally} />
        </Feature>
        <Feature
          tone="sea"
          pos="100% 30%"
          title="Every action on the record"
          body="Enrolments and ballots are public transactions. A second ballot from the same member is refused."
        >
          <HistoryMini events={live.events} failed={live.status === 'error' || live.historyFailed} />
        </Feature>
        <Feature
          wide
          tone="gold"
          pos="20% 70%"
          title="Rules you can read"
          body="The contract is written in Compact and open source. Every check a ballot must pass is right there."
        >
          <CircuitsMini />
        </Feature>
        <Feature
          wide
          tone="gold"
          pos="85% 35%"
          title="Wallets you already use"
          body="Connect Lace or 1AM on Midnight Preprod. No accounts, emails or passwords."
        >
          <WalletsMini />
        </Feature>
      </div>
    </section>
  );
}
