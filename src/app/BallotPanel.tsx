import type { CSSProperties } from 'react';
import type { PrivacyView, TallyView } from '../view';
import { ArrowDown, Check, Lock, Wallet } from '../ui/icons';
import { hostOf, middle, optionLabel, OPTION_COLORS } from '../ui/format';

type Props = {
  tally: TallyView | null;
  privacy: PrivacyView | null;
  connected: boolean;
  hasPoll: boolean;
  busy: string | null;
  notice: string | null;
  choice: number;
  proverUri: string;
  onChoose: (option: number) => void;
  onConnect: () => void;
  onEnrol: () => void;
  onVote: (option: number) => void;
};

const PROVING: Record<string, string> = {
  Enrolment: 'Building your enrolment proof…',
  'Poll creation': 'Deploying through your wallet. This takes a minute.',
};

function StatusLine({ busy, notice }: { busy: string | null; notice: string | null }) {
  if (busy) {
    return (
      <p className="status status-busy" role="status">
        <span className="spinner" />
        {PROVING[busy] ?? 'Proving you are enrolled and have not voted yet…'}
      </p>
    );
  }
  if (!notice) return null;
  const ok = notice.endsWith('confirmed on chain.');
  return (
    <p className={ok ? 'status status-ok' : 'status status-bad'} role="status">
      {notice}
    </p>
  );
}

export function BallotPanel(props: Props) {
  const { tally, privacy, connected, hasPoll, busy, notice, choice, proverUri, onChoose, onConnect, onEnrol, onVote } =
    props;
  const counts = tally?.counts ?? [0, 0, 0];
  const enrolled = privacy?.enrolled === true;
  const voted = privacy?.voted === true;
  const idle = busy === null;
  const canEnrol = connected && hasPoll && idle && !enrolled;
  const canVote = connected && hasPoll && idle && enrolled && !voted;
  const proving = busy?.startsWith('Ballot') ?? false;

  const voteLabel = proving
    ? 'Proving your ballot…'
    : voted
      ? 'Ballot counted'
      : enrolled
        ? `Prove and vote ${optionLabel(choice)}`
        : 'Enrol before voting';

  const membership = !connected ? 'Wallet needed' : enrolled ? 'In the roster' : 'Not enrolled';

  return (
    <section className="card ballot" aria-labelledby="ballot-title">
      <header className="ballot-head">
        <h3 id="ballot-title">Cast a ballot</h3>
        <span className="chip">
          <Lock size={12} />
          Private
        </span>
      </header>

      <div className="ballot-block">
        <div className="block-top">
          <span className="muted">Membership</span>
          <span className={enrolled ? 'tag tag-green' : 'tag'}>{membership}</span>
        </div>
        <div className="block-main">
          <strong>{enrolled ? 'Enrolled' : 'Step 1 · Enrol'}</strong>
          {!enrolled && (
            <button className="btn btn-dark btn-sm" onClick={onEnrol} disabled={!canEnrol}>
              {busy === 'Enrolment' ? 'Proving…' : 'Enrol'}
            </button>
          )}
        </div>
        <code className="block-sub">
          {privacy ? `commitment ${middle(privacy.commitment, 10, 6)}` : 'publishes a hash, never the secret'}
        </code>
      </div>

      <div className="ballot-divider" aria-hidden="true">
        <span>
          <ArrowDown size={13} />
        </span>
      </div>

      <div className="ballot-block">
        <div className="block-top">
          <span className="muted">Your choice</span>
          <span className={voted ? 'tag tag-green' : 'tag'}>{voted ? 'Nullifier spent' : 'One ballot'}</span>
        </div>
        <div className="choices" role="radiogroup" aria-label="Your choice">
          {counts.map((_, index) => (
            <button
              key={index}
              role="radio"
              aria-checked={index === choice}
              className={index === choice ? 'choice is-on' : 'choice'}
              style={{ '--c': OPTION_COLORS[index] } as CSSProperties}
              onClick={() => onChoose(index)}
              disabled={voted}
            >
              <i />
              {optionLabel(index)}
              {index === choice && <Check size={13} />}
            </button>
          ))}
        </div>
      </div>

      {connected ? (
        <button className="btn btn-light btn-block" onClick={() => onVote(choice)} disabled={!canVote}>
          {voted && <Check size={15} />}
          {voteLabel}
        </button>
      ) : (
        <button className="btn btn-light btn-block" onClick={onConnect}>
          <Wallet size={15} />
          Connect wallet to vote
        </button>
      )}

      <StatusLine busy={busy} notice={notice} />

      <dl className="facts">
        <div>
          <dt>Ballot proof</dt>
          <dd>zero-knowledge</dd>
        </div>
        <div>
          <dt>Anonymity set</dt>
          <dd>{tally ? `${tally.enrolled.toLocaleString()} ${tally.enrolled === 1 ? 'member' : 'members'}` : '—'}</dd>
        </div>
        <div>
          <dt>Prover</dt>
          <dd>{proverUri ? hostOf(proverUri) : 'wallet default'}</dd>
        </div>
      </dl>
    </section>
  );
}
