import type { PrivacyView, TallyView } from '../view';
import { Check, Copy, Plus, Refresh } from '../ui/icons';
import { percent, ROSTER_CAPACITY } from '../ui/format';

type Props = {
  tally: TallyView | null;
  privacy: PrivacyView | null;
  connected: boolean;
  hasPoll: boolean;
  busy: string | null;
  copied: boolean;
  onEnrol: () => void;
  onCopyInvite: () => void;
  onRefresh: () => void;
};

const show = (value: number | undefined) => (value === undefined ? '—' : value.toLocaleString());

export function Overview({
  tally,
  privacy,
  connected,
  hasPoll,
  busy,
  copied,
  onEnrol,
  onCopyInvite,
  onRefresh,
}: Props) {
  const enrolled = privacy?.enrolled === true;
  const canEnrol = connected && hasPoll && busy === null && !enrolled;

  return (
    <section className="overview">
      <article className="card stat">
        <header className="stat-head">
          <span>Members enrolled</span>
          <span className="chip">of {ROSTER_CAPACITY.toLocaleString()} seats</span>
        </header>
        <strong className="stat-value">{show(tally?.enrolled)}</strong>
        <div className="stat-actions">
          <button className="btn btn-dark btn-sm" onClick={onEnrol} disabled={!canEnrol}>
            {enrolled ? <Check size={14} /> : <Plus size={14} />}
            {busy === 'Enrolment' ? 'Proving…' : enrolled ? 'Enrolled' : 'Enrol'}
          </button>
          <button className="btn btn-dark btn-sm" onClick={onCopyInvite} disabled={!hasPoll}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy invite'}
          </button>
        </div>
      </article>

      <article className="card stat">
        <header className="stat-head">
          <span>Ballots cast</span>
          <button className="btn btn-dark btn-xs" onClick={onRefresh} disabled={!hasPoll}>
            <Refresh size={12} />
            Refresh
          </button>
        </header>
        <div className="stat-line">
          <strong className="stat-value">{show(tally?.cast)}</strong>
          {tally && (
            <span className="stat-meta">
              <span className="tag tag-green">{percent(tally.cast, tally.enrolled)}%</span>
              turnout
            </span>
          )}
        </div>
      </article>

      <article className="card stat">
        <header className="stat-head">
          <span>Voters identified</span>
          <span className="chip">by design</span>
        </header>
        <div className="stat-line">
          <strong className="stat-value">0</strong>
          <span className="stat-meta">
            <span className="tag tag-violet">zero-knowledge</span>
            unlinkable
          </span>
        </div>
      </article>
    </section>
  );
}
