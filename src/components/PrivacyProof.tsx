import type { PrivacyView } from '../view';

type Props = {
  privacy: PrivacyView | null;
};

const truncate = (value: string) => `${value.slice(0, 14)}…${value.slice(-8)}`;

export function PrivacyProof({ privacy }: Props) {
  return (
    <article className="card glass">
      <header className="card-head">
        <h3>What the chain learns</h3>
        <p>Every value here is read live from the ledger. Nothing is a claim you have to take on trust.</p>
      </header>

      {!privacy ? (
        <p className="empty">Connect a wallet to see exactly what this poll publishes about you.</p>
      ) : (
        <>
          <div className="proof-cols">
            <div className="proof-col">
              <h4>
                <i />
                Published on chain
              </h4>
              <dl>
                <div className="proof-item">
                  <dt>Your commitment</dt>
                  <dd>
                    <code>{truncate(privacy.commitment)}</code>
                    <span className={privacy.enrolled ? 'tag tag-on' : 'tag'}>
                      {privacy.enrolled ? 'in the roster' : 'not enrolled'}
                    </span>
                  </dd>
                </div>
                <div className="proof-item">
                  <dt>Your nullifier</dt>
                  <dd>
                    <code>{truncate(privacy.nullifier)}</code>
                    <span className={privacy.voted ? 'tag tag-on' : 'tag'}>{privacy.voted ? 'spent' : 'unspent'}</span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="proof-col private">
              <h4>
                <i />
                Never left this browser
              </h4>
              <dl>
                <div className="proof-item">
                  <dt>Member secret</dt>
                  <dd>
                    <code className="redacted">••••••••••••••••••••</code>
                    <span className="tag">never transmitted</span>
                  </dd>
                </div>
                <div className="proof-item">
                  <dt>Merkle path</dt>
                  <dd>
                    <code className="redacted">••••••••••••••••••••</code>
                    <span className="tag">proves membership, names no one</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {privacy.voted && (
            <p className="anonymity">
              Your ballot is counted and indistinguishable from <strong>{privacy.anonymitySet}</strong>{' '}
              {privacy.anonymitySet === 1 ? 'enrolled member' : 'enrolled members'}. The commitment and the nullifier
              above are both public — and nothing on chain links them to each other.
            </p>
          )}
        </>
      )}
    </article>
  );
}
