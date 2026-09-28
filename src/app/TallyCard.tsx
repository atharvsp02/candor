import type { CSSProperties } from 'react';
import type { TallyView } from '../view';
import { useState } from 'react';
import { NewPollForm } from './NewPollForm';
import type { PollDraft } from '../hooks/useMidnight';
import { Plus, Refresh, Wallet } from '../ui/icons';
import { optionLabel, OPTION_COLORS, percent } from '../ui/format';

type TallyProps = {
  tally: TallyView | null;
  choice: number;
  onChoose: (option: number) => void;
  onRefresh: () => void;
};

const GRID = [100, 75, 50, 25, 0];

export function TallyCard({ tally, choice, onChoose, onRefresh }: TallyProps) {
  const counts = tally?.counts ?? [0, 0, 0];
  const labels = tally?.labels;
  const total = counts.reduce((sum, n) => sum + n, 0);
  const selected = Math.min(choice, counts.length - 1);
  const leader = total > 0 ? counts.indexOf(Math.max(...counts)) : -1;

  return (
    <section className="card tally" aria-labelledby="tally-title">
      <header className="tally-tabs" role="tablist" aria-label="Options">
        {counts.map((count, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={index === selected}
            className={index === selected ? 'tally-tab is-on' : 'tally-tab'}
            style={{ '--c': OPTION_COLORS[index] } as CSSProperties}
            onClick={() => onChoose(index)}
          >
            <i />
            {optionLabel(index, labels)}
            <span>{`{${count}}`}</span>
          </button>
        ))}
        <button className="icon-btn tally-refresh" onClick={onRefresh} aria-label="Refresh tally" title="Refresh">
          <Refresh size={14} />
        </button>
      </header>

      {tally?.question && <p className="tally-question">{tally.question}</p>}

      <div className="tally-body">
        <div className="tally-summary">
          <span id="tally-title" className="muted">
            Ballots for {optionLabel(selected, labels)}
          </span>
          <div className="tally-figure">
            <strong>{tally ? counts[selected].toLocaleString() : '—'}</strong>
            <span className="chip">of {total.toLocaleString()}</span>
          </div>
          <span className="tally-note">
            <span className="up">{percent(counts[selected], total)}%</span>
            {leader === -1
              ? 'no ballots yet'
              : leader === selected
                ? 'leading the poll'
                : `${optionLabel(leader, labels)} is leading`}
          </span>
        </div>

        <div className="chart" role="img" aria-label={counts.map((c, i) => `${optionLabel(i, labels)} ${c}`).join(', ')}>
          <div className="chart-grid" aria-hidden="true">
            {GRID.map((line) => (
              <span key={line} style={{ bottom: `${line}%` }}>
                <em>{line}%</em>
              </span>
            ))}
          </div>
          <div className="chart-cols">
            {counts.map((count, index) => {
              const share = percent(count, total);
              return (
                <button
                  key={index}
                  className={index === selected ? 'col is-on' : 'col'}
                  style={{ '--h': `${share}%`, '--c': OPTION_COLORS[index] } as CSSProperties}
                  onClick={() => onChoose(index)}
                  aria-label={`${optionLabel(index, labels)}: ${count} ballots, ${share}%`}
                >
                  <span className="col-track">
                    <span className="col-bar" />
                    <span className="col-tip">
                      {count} · {share}%
                    </span>
                  </span>
                  <span className="col-label">{optionLabel(index, labels)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

type EmptyProps = {
  connected: boolean;
  busy: string | null;
  startOpen?: boolean;
  onConnect: () => void;
  onCreatePoll: (draft: PollDraft) => void;
  onCancel?: () => void;
};

export function EmptyPoll({ connected, busy, startOpen, onConnect, onCreatePoll, onCancel }: EmptyProps) {
  const [writing, setWriting] = useState(startOpen === true);

  if (connected && writing) {
    return (
      <section className="card empty-poll">
        <div className="empty-panel empty-panel-form">
          <span className="dash-kicker">New poll</span>
          <h3>Write the question.</h3>
          <NewPollForm
            busy={busy}
            onCreate={onCreatePoll}
            onCancel={() => {
              setWriting(false);
              onCancel?.();
            }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="card empty-poll art" data-tone="dusk">
      <div className="empty-panel">
        <span className="dash-kicker">No poll selected</span>
        <h3>Open an invite link, or start a poll of your own.</h3>
        <p>A poll is its own contract on Midnight. Deploying one takes a single wallet approval.</p>
        {connected ? (
          <button className="btn btn-light" onClick={() => setWriting(true)} disabled={busy !== null}>
            <Plus size={15} />
            {busy === 'Poll creation' ? 'Deploying…' : 'Create a poll'}
          </button>
        ) : (
          <button className="btn btn-light" onClick={onConnect}>
            <Wallet size={15} />
            Connect wallet
          </button>
        )}
      </div>
    </section>
  );
}
