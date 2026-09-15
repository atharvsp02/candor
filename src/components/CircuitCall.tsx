import type { Tally } from '../hooks/useMidnight';

type Props = {
  connected: boolean;
  tally: Tally | null;
  busy: string | null;
  notice: string | null;
  onEnrol: () => void;
  onVote: (option: number) => void;
};

const LABELS = ['Yes', 'No', 'Abstain'];

export function CircuitCall({ connected, tally, busy, notice, onEnrol, onVote }: Props) {
  const total = tally ? tally.counts.reduce((sum, n) => sum + n, 0n) : 0n;

  return (
    <section className="panel">
      <header className="panel-head">
        <h2>The ballot</h2>
        <p>Enrol once, then vote once. The chain proves both without learning who you are.</p>
      </header>

      <div className="actions">
        <button onClick={onEnrol} disabled={!connected || busy !== null}>
          {busy === 'Enrolment' ? 'Proving…' : 'Enrol in this poll'}
        </button>
      </div>

      <ol className="options">
        {(tally?.counts ?? [0n, 0n, 0n]).map((count, index) => {
          const share = total > 0n ? Number((count * 100n) / total) : 0;
          const label = busy === `Ballot for option ${index}`;
          return (
            <li key={index}>
              <div className="option-row">
                <span className="option-name">{LABELS[index] ?? `Option ${index}`}</span>
                <span className="option-count">{count.toString()}</span>
                <button className="ghost" onClick={() => onVote(index)} disabled={!connected || busy !== null}>
                  {label ? 'Proving…' : 'Vote'}
                </button>
              </div>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${share}%` }} />
              </div>
            </li>
          );
        })}
      </ol>

      {busy && (
        <p className="proving">
          <span className="spinner" />
          Generating a zero-knowledge proof in your browser. Your secret never leaves this machine.
        </p>
      )}

      {notice && !busy && <p className="notice">{notice}</p>}

      <footer className="panel-foot">
        <span className="badge">Proved without revealing your input</span>
        {tally && (
          <span className="counts">
            {tally.enrolled.toString()} enrolled · {tally.cast.toString()} ballots · {tally.spent.toString()} nullifiers
            spent
          </span>
        )}
      </footer>
    </section>
  );
}
