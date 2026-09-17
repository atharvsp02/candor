import type { CSSProperties, ReactNode } from 'react';
import { Alert, Check, Cpu, Key, Wallet } from '../ui/icons';
import { OPTION_COLORS } from '../ui/format';
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
        <div className="mini" aria-hidden="true">
          {children}
        </div>
      </Art>
      <div className="feature-copy">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </article>
  );
}

const OPTIONS = [
  { label: 'Yes', count: 53 },
  { label: 'No', count: 29 },
  { label: 'Abstain', count: 9 },
];

function TallyMini() {
  return (
    <>
      <div className="mini-head">
        <div>
          <span className="mini-label">Ballots cast</span>
          <strong className="mini-value">
            91 <span className="tag tag-green">71% turnout</span>
          </strong>
        </div>
        <span className="mini-btn">Recount</span>
      </div>
      <div className="mini-seg">
        {OPTIONS.map((option, index) => (
          <span key={option.label} className={index === 0 ? 'is-on' : undefined}>
            {option.label}
          </span>
        ))}
      </div>
      <div className="mini-bars">
        {OPTIONS.map((option, index) => (
          <div key={option.label}>
            <i style={{ height: Math.round((option.count * 34) / 53), background: OPTION_COLORS[index] }} />
            <span>{option.count}</span>
          </div>
        ))}
      </div>
    </>
  );
}

const SPLIT = [
  { label: 'Enrolled', value: '128', width: '100%' },
  { label: 'Voted', value: '91', width: '71%' },
  { label: 'Linked', value: '0', width: '2%' },
];

function RosterMini() {
  return (
    <>
      <div className="mini-head">
        <div>
          <span className="mini-label">Roster</span>
          <strong className="mini-value">
            128 <span className="tag">members</span>
          </strong>
        </div>
        <span className="mini-btn">Root</span>
      </div>
      <div className="mini-split">
        {SPLIT.map((item, index) => (
          <div key={item.label}>
            <span className="mini-label">{item.label}</span>
            <strong>{item.value}</strong>
            <i style={{ width: item.width, background: OPTION_COLORS[index] } as CSSProperties} />
          </div>
        ))}
      </div>
    </>
  );
}

const EVENTS = [
  { tone: 'ok', title: 'Ballot accepted', detail: 'nullifier 9d02…f5e4 spent', time: 'Now' },
  { tone: 'bad', title: 'Second ballot rejected', detail: 'this member has already voted', time: '2 min' },
  { tone: 'info', title: 'Member enrolled', detail: 'commitment 3fa1…c12b added', time: '6 min' },
];

function GuardMini() {
  return (
    <ul className="mini-events">
      {EVENTS.map((event) => (
        <li key={event.title} className={`ev ev-${event.tone}`}>
          <span className="ev-icon">{event.tone === 'bad' ? <Alert size={15} /> : <Check size={14} />}</span>
          <div>
            <strong>{event.title}</strong>
            <span>{event.detail}</span>
          </div>
          <time>{event.time}</time>
        </li>
      ))}
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
  { name: 'Lace', detail: 'Midnight Preprod', icon: Wallet, action: 'Connect' },
  { name: '1AM', detail: 'Midnight Preprod', icon: Key, action: 'Connect' },
  { name: 'DApp Connector v4', detail: 'any compatible wallet', icon: Cpu, action: 'Supported' },
  { name: 'Local proof server', detail: 'localhost:6300', icon: Cpu, action: 'Optional' },
];

function WalletsMini() {
  return (
    <ul className="mini-rows">
      {WALLETS.map(({ name, detail, icon: Icon, action }) => (
        <li key={name}>
          <span className="row-icon">
            <Icon size={14} />
          </span>
          <span className="row-name">{name}</span>
          <span className="row-mid row-muted">{detail}</span>
          <span className="row-pill">{action}</span>
        </li>
      ))}
    </ul>
  );
}

export function Features() {
  return (
    <section className="block" id="features">
      <SectionHead kicker="Solution" title="One member. One ballot. Zero trace." />
      <div className="features">
        <Feature
          tone="sea"
          pos="10% 40%"
          title="Live, recountable tally"
          body="Results are read straight from the Midnight ledger, so anyone can check the count themselves."
        >
          <TallyMini />
        </Feature>
        <Feature
          tone="sea"
          pos="70% 60%"
          title="Membership without names"
          body="Voters prove they sit somewhere in the roster without revealing which entry is theirs."
        >
          <RosterMini />
        </Feature>
        <Feature
          tone="sea"
          pos="100% 30%"
          title="Double-vote guard"
          body="Each ballot spends a one-time nullifier. Try to vote again and the contract refuses."
        >
          <GuardMini />
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
