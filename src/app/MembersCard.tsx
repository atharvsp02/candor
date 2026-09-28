import { useState } from 'react';
import type { Eligibility } from '../hooks/useMidnight';
import type { PrivacyView } from '../view';
import { Check, Copy, Key, Link } from '../ui/icons';
import { middle } from '../ui/format';
import { useCopy } from './useCopy';

type Props = {
  privacy: PrivacyView | null;
  eligibility: Eligibility | null;
  connected: boolean;
  busy: string | null;
  issuedLink: string | null;
  onIssueTo: (holder: string, tier: number) => void;
  onConnect: () => void;
};

const MEMBER_CODE = /^[0-9a-f]{64}$/i;

export function MembersCard({ privacy, eligibility, connected, busy, issuedLink, onIssueTo, onConnect }: Props) {
  const { copied, copy } = useCopy();
  const [holder, setHolder] = useState('');
  const minTier = Number(eligibility?.minTier ?? 0);
  const [tier, setTier] = useState(Math.max(1, minTier));

  const code = holder.trim().toLowerCase();
  const valid = MEMBER_CODE.test(code);
  const issuing = busy?.startsWith('Credential') ?? false;

  if (!connected) {
    return (
      <section className="card members">
        <header className="card-head">
          <h3>Members</h3>
        </header>
        <p className="members-lead">Connect a wallet to see your member code, or to issue credentials if you run this poll.</p>
        <button className="btn btn-light" onClick={onConnect}>
          Connect wallet
        </button>
      </section>
    );
  }

  return (
    <div className="dash-row dash-row-foot">
      <section className="card members" aria-labelledby="member-code-title">
        <header className="card-head">
          <h3 id="member-code-title">Your member code</h3>
          <span className="chip">public</span>
        </header>
        <p className="members-lead">
          Send this to whoever runs the poll. It is the public half of your membership: it names no one, and it is the
          same value that enters the roster when you enrol.
        </p>
        {privacy ? (
          <div className="code-box">
            <code>{privacy.commitment}</code>
            <button className="btn btn-dark btn-sm" onClick={() => copy('code', privacy.commitment)}>
              {copied === 'code' ? <Check size={13} /> : <Copy size={13} />}
              {copied === 'code' ? 'Copied' : 'Copy code'}
            </button>
          </div>
        ) : (
          <p className="members-note">Open a poll to see your code.</p>
        )}
        <p className="members-note">
          The organiser sends back a credential link. Open it in this browser: the credential is bound to this code, so it
          will not work anywhere else.
        </p>
      </section>

      {eligibility?.isIssuer && (
        <section className="card members" aria-labelledby="issue-title">
          <header className="card-head">
            <h3 id="issue-title">Issue a credential</h3>
            <span className="chip">
              <Key size={12} />
              organiser
            </span>
          </header>
          <p className="members-lead">
            Paste a member&rsquo;s code and choose their tier. Only a hash reaches the chain; the tier travels to them in
            the link below.
          </p>

          <label className="field">
            <span className="field-label">Member code</span>
            <input
              className="field-input mono"
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
              placeholder="64 hex characters"
              spellCheck={false}
            />
            {holder && !valid && <span className="field-hint field-bad">That is not a member code.</span>}
          </label>

          <label className="field">
            <span className="field-label">Tier</span>
            <div className="tier-row">
              <input
                className="tier-slider"
                type="range"
                min={0}
                max={8}
                value={tier}
                onChange={(e) => setTier(Number(e.target.value))}
              />
              <span className={tier >= minTier ? 'chip' : 'chip chip-bad'}>tier {tier}</span>
            </div>
            <span className="field-hint">
              {tier >= minTier
                ? `Clears this poll's threshold of tier ${minTier}.`
                : `Below this poll's threshold of tier ${minTier}. The member will be turned away at enrolment.`}
            </span>
          </label>

          <button
            className="btn btn-light"
            onClick={() => onIssueTo(code, tier)}
            disabled={!valid || busy !== null}
          >
            <Key size={14} />
            {issuing ? 'Issuing…' : 'Issue credential'}
          </button>

          {issuedLink && (
            <div className="issued">
              <span className="field-label">Credential link</span>
              <div className="code-box">
                <code>{middle(issuedLink, 48, 12)}</code>
                <button className="btn btn-dark btn-sm" onClick={() => copy('link', issuedLink)}>
                  {copied === 'link' ? <Check size={13} /> : <Link size={13} />}
                  {copied === 'link' ? 'Copied' : 'Copy link'}
                </button>
              </div>
              <span className="field-hint">
                Send this privately. It reveals the member&rsquo;s tier, never their ballot, and it only works for the
                code it was issued to.
              </span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
