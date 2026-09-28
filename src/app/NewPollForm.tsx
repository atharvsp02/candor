import { useState } from 'react';
import type { PollDraft } from '../hooks/useMidnight';
import { Plus, Trash } from '../ui/icons';

type Props = {
  busy: string | null;
  onCreate: (draft: PollDraft) => void;
  onCancel?: () => void;
};

const MAX_OPTIONS = 8;

export function NewPollForm({ busy, onCreate, onCancel }: Props) {
  const [question, setQuestion] = useState('');
  const [labels, setLabels] = useState(['Yes', 'No', 'Abstain']);
  const [threshold, setThreshold] = useState(1);

  const filled = labels.map((l) => l.trim()).filter(Boolean);
  const ready = question.trim().length > 0 && filled.length >= 2 && busy === null;

  const setLabel = (index: number, value: string) =>
    setLabels((current) => current.map((l, i) => (i === index ? value : l)));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    onCreate({ question: question.trim(), labels: filled, threshold: BigInt(threshold) });
  };

  return (
    <form className="poll-form" onSubmit={submit}>
      <label className="field">
        <span className="field-label">Question</span>
        <input
          className="field-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Should the society switch to monthly meetings?"
          maxLength={140}
          autoFocus
        />
        <span className="field-hint">Published on chain, so anyone opening the link sees what is being asked.</span>
      </label>

      <fieldset className="field">
        <legend className="field-label">Options</legend>
        <div className="option-rows">
          {labels.map((label, index) => (
            <div className="option-row" key={index}>
              <i className="option-dot" data-index={index} />
              <input
                className="field-input"
                value={label}
                onChange={(e) => setLabel(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                maxLength={40}
              />
              {labels.length > 2 && (
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setLabels((c) => c.filter((_, i) => i !== index))}
                  aria-label={`Remove option ${index + 1}`}
                >
                  <Trash size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        {labels.length < MAX_OPTIONS && (
          <button type="button" className="btn btn-dark btn-sm" onClick={() => setLabels((c) => [...c, ''])}>
            <Plus size={13} />
            Add option
          </button>
        )}
      </fieldset>

      <label className="field">
        <span className="field-label">Eligibility threshold</span>
        <div className="tier-row">
          <input
            className="tier-slider"
            type="range"
            min={0}
            max={8}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
          <span className="chip">tier {threshold} and up</span>
        </div>
        <span className="field-hint">
          {threshold === 0
            ? 'Anyone you issue a credential to can enrol.'
            : `A member proves their credential reaches tier ${threshold} without revealing which tier they hold.`}
        </span>
      </label>

      <div className="poll-form-actions">
        <button className="btn btn-light" type="submit" disabled={!ready}>
          {busy === 'Poll creation' ? 'Deploying…' : 'Deploy poll'}
        </button>
        {onCancel && (
          <button className="btn btn-dark" type="button" onClick={onCancel} disabled={busy !== null}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
