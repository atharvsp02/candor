import { CheckCircle, ChevronRight } from '../ui/icons';
import { CONTRACT_SOURCE_URL, REPO_URL } from '../ui/format';
import { Art, SectionHead, reveal, type Tone } from './common';

const LAYERS: {
  tone: Tone;
  pos: string;
  label: string;
  badge?: string;
  title: string;
  sub: string;
  lead: string;
  items: string[];
  cta: { label: string; href: string; light?: boolean };
}[] = [
  {
    tone: 'sea',
    pos: '40% 10%',
    label: 'On chain',
    title: 'Public ledger',
    sub: 'Readable by anyone, forever',
    lead: 'Holds:',
    items: ['Roster of member commitments', 'Spent nullifiers', 'Ballot count per option', 'Totals enrolled and cast'],
    cta: { label: 'Check it on the indexer', href: `${REPO_URL}#contract-address` },
  },
  {
    tone: 'ember',
    pos: '70% 40%',
    label: 'In the proof',
    badge: 'Zero-knowledge',
    title: 'Proven, never shown',
    sub: 'Checked by the network without naming you',
    lead: 'Proves that:',
    items: [
      'Your commitment is in the roster',
      'Your nullifier comes from the same secret',
      'Your choice is on the ballot',
      'You have not voted before',
    ],
    cta: { label: 'Read the contract', href: CONTRACT_SOURCE_URL, light: true },
  },
  {
    tone: 'dusk',
    pos: '20% 80%',
    label: 'In your browser',
    title: 'Never on chain',
    sub: 'Kept on your device',
    lead: 'Keeps:',
    items: [
      'Your 32-byte member secret',
      'Your Merkle path',
      'The witnesses behind each proof',
      'The link between you and your ballot',
    ],
    cta: { label: 'Try it live', href: '/app' },
  },
];

export function Layers() {
  return (
    <section className="block" id="privacy">
      <SectionHead kicker="Privacy model" title="What is public, and what stays yours" />
      <div className="layers">
        {LAYERS.map((layer, index) => (
          <article key={layer.label} className={layer.badge ? 'layer is-featured' : 'layer'} {...reveal(index)}>
            <Art tone={layer.tone} pos={layer.pos} zoom="260% auto" className="layer-head">
              <span>{layer.label}</span>
              {layer.badge && <em>{layer.badge}</em>}
            </Art>
            <div className="layer-body">
              <div>
                <h3>{layer.title}</h3>
                <p>{layer.sub}</p>
              </div>
              <strong>{layer.lead}</strong>
              <ul>
                {layer.items.map((item) => (
                  <li key={item}>
                    <CheckCircle size={16} />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                className={layer.cta.light ? 'btn btn-light btn-block' : 'btn btn-dark btn-block'}
                href={layer.cta.href}
                {...(layer.cta.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {layer.cta.label}
                {layer.cta.light && <ChevronRight size={16} className="chev" />}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
