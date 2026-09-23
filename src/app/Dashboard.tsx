import { useEffect, useState } from 'react';
import type { Status } from '../hooks/useMidnight';
import type { Eligibility } from '../hooks/useMidnight';
import type { PrivacyView, TallyView } from '../view';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Overview } from './Overview';
import { TallyCard, EmptyPoll } from './TallyCard';
import { BallotPanel } from './BallotPanel';
import { PrivacyCard } from './PrivacyCard';
import { DetailsCard } from './DetailsCard';
import { PrivacyModel } from './PrivacyModel';
import { ContractCard } from './ContractCard';
import { useCopy } from './useCopy';

export const VIEWS = ['overview', 'ballot', 'privacy', 'details'] as const;

export type View = (typeof VIEWS)[number];

const readView = (): View => {
  const hash = window.location.hash.replace('#', '');
  return (VIEWS as readonly string[]).includes(hash) ? (hash as View) : 'overview';
};

export type ActivityEntry = {
  readonly id: string;
  readonly at: Date;
  readonly title: string;
  readonly detail?: string;
  readonly tone: 'ok' | 'bad' | 'info';
};

export type DashboardProps = {
  status: Status;
  tally: TallyView | null;
  privacy: PrivacyView | null;
  eligibility: Eligibility | null;
  busy: string | null;
  notice: string | null;
  contractAddress: string;
  networkId: string;
  proverUri: string;
  shareUrl: string;
  activity: readonly ActivityEntry[] | null;
  activityFailed?: boolean;
  preview?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onCreatePoll: () => void;
  onIssue: () => void;
  onEnrol: () => void;
  onVote: (option: number) => void;
  onRefresh: () => void;
};

export function Dashboard(props: DashboardProps) {
  const { status, tally, privacy, eligibility, busy, notice, contractAddress, preview } = props;
  const [choice, setChoice] = useState(0);
  const [view, setView] = useState<View>(() => (preview ? 'overview' : readView()));
  const { copied, copy } = useCopy();
  const connected = status.kind === 'connected';
  const hasPoll = Boolean(contractAddress);

  useEffect(() => {
    if (preview) return;
    const update = () => setView(readView());
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [preview]);

  const ballot = (
    <BallotPanel
      tally={tally}
      privacy={privacy}
      eligibility={eligibility}
      connected={connected}
      hasPoll={hasPoll}
      busy={busy}
      notice={notice}
      choice={choice}
      proverUri={props.proverUri}
      onChoose={setChoice}
      onConnect={props.onConnect}
      onIssue={props.onIssue}
      onEnrol={props.onEnrol}
      onVote={props.onVote}
    />
  );

  const results = hasPoll ? (
    <TallyCard tally={tally} choice={choice} onChoose={setChoice} onRefresh={props.onRefresh} />
  ) : (
    <EmptyPoll connected={connected} busy={busy} onConnect={props.onConnect} onCreatePoll={props.onCreatePoll} />
  );

  const privacyCard = <PrivacyCard privacy={privacy} tally={tally} eligibility={eligibility} connected={connected} />;

  const details = (
    <DetailsCard
      contractAddress={contractAddress}
      shareUrl={props.shareUrl}
      networkId={props.networkId}
      options={tally?.counts.length ?? 0}
      activity={props.activity}
      activityFailed={props.activityFailed ?? false}
      copied={copied}
      onCopy={copy}
    />
  );

  return (
    <div className={preview ? 'dash is-preview' : 'dash'}>
      <div className="dash-shell">
        <Sidebar view={view} connected={connected} busy={busy} onCreatePoll={props.onCreatePoll} />

        <div className="dash-main">
          <Topbar
            status={status}
            networkId={props.networkId}
            contractAddress={contractAddress}
            shareUrl={props.shareUrl}
            copied={copied === 'topbar'}
            onCopy={() => copy('topbar', props.shareUrl)}
            onConnect={props.onConnect}
            onDisconnect={props.onDisconnect}
          />

          <main className="dash-body">
            {status.kind === 'error' && (
              <div className="banner" role="alert">
                <strong>Wallet not connected.</strong> {status.message}
              </div>
            )}

            {view === 'overview' && (
              <>
                <Overview
                  tally={tally}
                  privacy={privacy}
                  connected={connected}
                  hasPoll={hasPoll}
                  busy={busy}
                  copied={copied === 'invite'}
                  onEnrol={props.onEnrol}
                  onCopyInvite={() => copy('invite', props.shareUrl)}
                  onRefresh={props.onRefresh}
                />
                <div className="dash-row dash-row-main">
                  {results}
                  {ballot}
                </div>
                <div className="dash-row dash-row-foot">
                  {privacyCard}
                  {details}
                </div>
              </>
            )}

            {view === 'ballot' && (
              <div className="dash-row dash-row-main">
                {results}
                {ballot}
              </div>
            )}

            {view === 'privacy' && (
              <>
                {privacyCard}
                <PrivacyModel />
              </>
            )}

            {view === 'details' && (
              <div className="dash-row dash-row-foot">
                {details}
                <ContractCard />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
