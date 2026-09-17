import type { TallyView } from '../view';

type Props = {
  connected: boolean;
  hasPoll: boolean;
  shareUrl: string;
  onCreatePoll: () => void;
  tally: TallyView | null;
  busy: string | null;
  notice: string | null;
  onEnrol: () => void;
  onVote: (option: number) => void;
};

const LABELS = ['Yes', 'No', 'Abstain'];

const Status = ({ busy, notice, proving }: { busy: string | null; notice: string | null; proving: string }) => {
  if (busy) {
    return (
      <p className="status status-proving">
        <span className="spinner" />
        {proving}
      </p>
    );
  }
  if (!notice) return null;
  const ok = notice.includes('confirmed on chain');
  return <p className={ok ? 'status status-note' : 'status status-bad'}>{notice}</p>;
};

export function CircuitCall({ connected, hasPoll, shareUrl, tally, busy, notice, onCreatePoll, onEnrol, onVote }: Props) {
  if (!hasPoll) {
    return (
      <article className="card glass">
        <header className="card-head">
          <h3>No poll yet</h3>
          <p>A poll is a contract of its own. Deploy one through your wallet to begin.</p>
        </header>
        <div className="actions">
          <button className="btn btn-primary" onClick={onCreatePoll} disabled={!connected || busy !== null}>
            {busy === 'Poll creation' ? 'Deploying…' : 'Create a poll'}
          </button>
        </div>
        <Status busy={busy} notice={notice} proving="Deploying through your wallet. This takes a minute." />
      </article>
    );
  }

  const counts = tally?.counts ?? [0, 0, 0];
  const total = counts.reduce((sum, n) => sum + n, 0);

  return (
    <article className="card glass">
      <header className="card-head">
        <h3>The ballot</h3>
        <p>Enrol once, then vote once. The chain proves both without learning who you are.</p>
      </header>

      <div className="share">
        <span className="share-label">Share</span>
        <code>{shareUrl}</code>
        <button className="btn btn-glass btn-sm" onClick={() => void navigator.clipboard.writeText(shareUrl)}>
          Copy link
        </button>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={onEnrol} disabled={!connected || busy !== null}>
          {busy === 'Enrolment' ? 'Proving…' : 'Enrol in this poll'}
        </button>
      </div>

      <ol className="options">
        {counts.map((count, index) => {
          const share = total > 0 ? (count * 100) / total : 0;
          const proving = busy === `Ballot for option ${index}`;
          return (
            <li key={index} className="option">
              <div className="option-fill" style={{ width: `${share}%` }} />
              <div className="option-row">
                <span className="option-name">{LABELS[index] ?? `Option ${index}`}</span>
                <span className="option-count">{count}</span>
                <span className="option-pct">{share.toFixed(0)}%</span>
                <button className="btn btn-glass btn-sm" onClick={() => onVote(index)} disabled={!connected || busy !== null}>
                  {proving ? 'Proving…' : 'Vote'}
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <Status
        busy={busy}
        notice={notice}
        proving="Generating a zero-knowledge proof in your browser. Your secret never leaves this machine."
      />

      <footer className="card-foot">
        <span className="badge">
          <span className="dot dot-live" />
          Proved without revealing your input
        </span>
        {tally && (
          <span className="counts">
            {tally.enrolled} enrolled · {tally.cast} ballots · {tally.spent} nullifiers
          </span>
        )}
      </footer>
    </article>
  );
}
