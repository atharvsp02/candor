import type { ActivityEntry } from './Dashboard';
import { Check, Copy } from '../ui/icons';
import { middle, when } from '../ui/format';

type Props = {
  contractAddress: string;
  shareUrl: string;
  networkId: string;
  options: number;
  activity: readonly ActivityEntry[] | null;
  activityFailed: boolean;
  copied: string | null;
  onCopy: (key: string, text: string) => void;
};

export function DetailsCard({
  contractAddress,
  shareUrl,
  networkId,
  options,
  activity,
  activityFailed,
  copied,
  onCopy,
}: Props) {
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

      <div className="activity" id="activity">
        <span className="activity-title">Activity</span>
        {activity === null && activityFailed ? (
          <p className="activity-empty">The poll’s history could not be read from the indexer just now.</p>
        ) : activity === null ? (
          <p className="activity-empty">
            <span className="spinner" />
            Reading the poll’s history from the ledger…
          </p>
        ) : activity.length === 0 ? (
          <p className="activity-empty">Nothing has happened on this poll yet.</p>
        ) : (
          <ol>
            {activity.map((entry) => (
              <li key={entry.id} className={`act act-${entry.tone}`}>
                <i />
                <div>
                  <strong>{entry.title}</strong>
                  {entry.detail && <span>{entry.detail}</span>}
                </div>
                <time dateTime={entry.at.toISOString()} title={entry.at.toLocaleString()}>
                  {when(entry.at)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
