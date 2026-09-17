import type { ActivityEntry } from './Dashboard';
import { Check, Copy } from '../ui/icons';
import { clock, middle } from '../ui/format';

type Props = {
  contractAddress: string;
  shareUrl: string;
  networkId: string;
  options: number;
  activity: readonly ActivityEntry[];
  copied: string | null;
  onCopy: (key: string, text: string) => void;
};

export function DetailsCard({ contractAddress, shareUrl, networkId, options, activity, copied, onCopy }: Props) {
  const invite = shareUrl.replace(/^https?:\/\//, '');

  return (
    <section className="card details" id="details" aria-labelledby="details-title">
      <header className="card-head">
        <h3 id="details-title">Poll details</h3>
      </header>

      <dl className="d-list">
        <div>
          <dt>Contract</dt>
          <dd>
            <code>{contractAddress ? middle(contractAddress, 10, 8) : '—'}</code>
            <button
              className="icon-btn"
              onClick={() => onCopy('contract', contractAddress)}
              disabled={!contractAddress}
              aria-label="Copy contract address"
            >
              {copied === 'contract' ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </dd>
        </div>
        <div>
          <dt>Invite link</dt>
          <dd>
            <code>{invite ? middle(invite, 18, 6) : '—'}</code>
            <button
              className="icon-btn"
              onClick={() => onCopy('share', shareUrl)}
              disabled={!shareUrl}
              aria-label="Copy invite link"
            >
              {copied === 'share' ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </dd>
        </div>
        <div>
          <dt>Network</dt>
          <dd>Midnight {networkId}</dd>
        </div>
        <div>
          <dt>Options</dt>
          <dd>{options || '—'}</dd>
        </div>
      </dl>

      <div className="activity">
        <span className="activity-title">Session activity</span>
        {activity.length === 0 ? (
          <p className="activity-empty">Wallet and ballot events from this session appear here as they happen.</p>
        ) : (
          <ol>
            {activity.map((entry) => (
              <li key={entry.id} className={`act act-${entry.tone}`}>
                <i />
                <div>
                  <strong>{entry.title}</strong>
                  {entry.detail && <span>{entry.detail}</span>}
                </div>
                <time dateTime={entry.at.toISOString()}>{clock(entry.at)}</time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
