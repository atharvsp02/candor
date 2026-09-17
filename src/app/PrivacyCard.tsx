import type { PrivacyView, TallyView } from '../view';
import { Globe, Lock } from '../ui/icons';
import { middle } from '../ui/format';

type Props = {
  privacy: PrivacyView | null;
  tally: TallyView | null;
  connected: boolean;
};

type RowProps = {
  label: string;
  value?: string;
  secret?: boolean;
  tag: string;
  on?: boolean;
};

function Row({ label, value, secret, tag, on }: RowProps) {
  return (
    <div className="p-row">
      <dt>{label}</dt>
      <dd>
        {secret ? (
          <code className="redacted">••••••••••••••••</code>
        ) : (
          <code>{value ? middle(value, 12, 8) : '—'}</code>
        )}
        <span className={on ? 'tag tag-green' : 'tag'}>{tag}</span>
      </dd>
    </div>
  );
}

export function PrivacyCard({ privacy, tally, connected }: Props) {
  const enrolled = privacy?.enrolled === true;
  const voted = privacy?.voted === true;

  const summary = voted
    ? `Your ballot is one of ${tally?.cast ?? 0}, indistinguishable among ${privacy?.anonymitySet ?? 0} enrolled members. Nothing on chain links your commitment to your nullifier.`
    : connected
      ? 'Both public values are hashes of a secret held only here. The contract never records which one belongs to whom.'
      : 'Connect a wallet to read back exactly what this poll has published about you.';

  return (
    <section className="card privacy" id="privacy" aria-labelledby="privacy-title">
      <header className="card-head">
        <h3 id="privacy-title">What the chain knows about you</h3>
        <span className="chip">
          <span className="dot dot-live" />
          Read live
        </span>
      </header>

      <div className="p-cols">
        <div className="p-col">
          <span className="p-col-title">
            <Globe size={14} />
            Published on chain
          </span>
          <dl>
            <Row
              label="Commitment"
              value={privacy?.commitment}
              tag={enrolled ? 'in roster' : 'not enrolled'}
              on={enrolled}
            />
            <Row label="Nullifier" value={privacy?.nullifier} tag={voted ? 'spent' : 'unspent'} on={voted} />
          </dl>
        </div>

        <div className="p-col p-col-private">
          <span className="p-col-title">
            <Lock size={14} />
            Never leaves this browser
          </span>
          <dl>
            <Row label="Member secret" secret tag="never sent" />
            <Row label="Merkle path" secret tag="names no leaf" />
          </dl>
        </div>
      </div>

      <p className="p-summary">{summary}</p>
    </section>
  );
}
