import type { PrivacyFacts } from '../hooks/useMidnight';

type Props = {
  privacy: PrivacyFacts | null;
};

const truncate = (value: string) => `${value.slice(0, 12)}…${value.slice(-8)}`;

export function PrivacyProof({ privacy }: Props) {
  if (!privacy) {
    return (
      <section className="panel">
        <header className="panel-head">
          <h2>What the chain learns</h2>
          <p>Connect a wallet to see exactly what this poll publishes about you.</p>
        </header>
      </section>
    );
  }

  return (
    <section className="panel">
      <header className="panel-head">
        <h2>What the chain learns</h2>
        <p>Every value below is read live from the ledger. Nothing here is a claim you have to take on trust.</p>
      </header>

      <div className="proof-grid">
        <div className="proof-col">
          <h3>Published on chain</h3>
          <dl>
            <dt>Your commitment</dt>
            <dd>
              <code>{truncate(privacy.commitment)}</code>
              <span className={privacy.enrolled ? 'tag tag-on' : 'tag'}>
                {privacy.enrolled ? 'in the roster' : 'not enrolled'}
              </span>
            </dd>
            <dt>Your nullifier</dt>
            <dd>
              <code>{truncate(privacy.nullifier)}</code>
              <span className={privacy.voted ? 'tag tag-on' : 'tag'}>
                {privacy.voted ? 'spent' : 'unspent'}
              </span>
            </dd>
          </dl>
        </div>

        <div className="proof-col">
          <h3>Never left this browser</h3>
          <dl>
            <dt>Member secret</dt>
            <dd>
              <code className="redacted">••••••••••••••••••••</code>
              <span className="tag">never transmitted</span>
            </dd>
            <dt>Merkle path</dt>
            <dd>
              <code className="redacted">••••••••••••••••••••</code>
              <span className="tag">proves membership without naming you</span>
            </dd>
          </dl>
        </div>
      </div>

      {privacy.voted && (
        <p className="anonymity">
          Your ballot is in the tally and is indistinguishable from{' '}
          <strong>{privacy.anonymitySet.toString()}</strong>{' '}
          {privacy.anonymitySet === 1n ? 'enrolled member' : 'enrolled members'}. The commitment above and the
          nullifier above are both public, and nothing on chain links them to each other.
        </p>
      )}
    </section>
  );
}
