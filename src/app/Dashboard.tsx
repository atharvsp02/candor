import { useState } from 'react';
import type { Status } from '../hooks/useMidnight';
import type { PrivacyView, TallyView } from '../view';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Overview } from './Overview';
import { TallyCard, EmptyPoll } from './TallyCard';
import { BallotPanel } from './BallotPanel';
import { PrivacyCard } from './PrivacyCard';
import { DetailsCard } from './DetailsCard';
import { useCopy } from './useCopy';

export type ActivityEntry = {
  readonly id: number;
  readonly at: Date;
  readonly title: string;
  readonly detail?: string;
  readonly tone: 'ok' | 'bad' | 'info';
};

export type DashboardProps = {
  status: Status;
  tally: TallyView | null;
  privacy: PrivacyView | null;
  busy: string | null;
  notice: string | null;
  contractAddress: string;
  networkId: string;
  proverUri: string;
  shareUrl: string;
  activity: readonly ActivityEntry[];
  preview?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onCreatePoll: () => void;
  onEnrol: () => void;
  onVote: (option: number) => void;
  onRefresh: () => void;
};

export function Dashboard(props: DashboardProps) {
  const { status, tally, privacy, busy, notice, contractAddress, preview } = props;
  const [choice, setChoice] = useState(0);
  const { copied, copy } = useCopy();
  const connected = status.kind === 'connected';
  const hasPoll = Boolean(contractAddress);

  return (
    <div className={preview ? 'dash is-preview' : 'dash'}>
      <div className="dash-shell">
        <Sidebar connected={connected} busy={busy} onCreatePoll={props.onCreatePoll} />

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
              {hasPoll ? (
                <TallyCard tally={tally} choice={choice} onChoose={setChoice} onRefresh={props.onRefresh} />
              ) : (
                <EmptyPoll
                  connected={connected}
                  busy={busy}
                  onConnect={props.onConnect}
                  onCreatePoll={props.onCreatePoll}
                />
              )}
              <BallotPanel
                tally={tally}
                privacy={privacy}
                connected={connected}
                hasPoll={hasPoll}
                busy={busy}
                notice={notice}
                choice={choice}
                proverUri={props.proverUri}
                onChoose={setChoice}
                onConnect={props.onConnect}
                onEnrol={props.onEnrol}
                onVote={props.onVote}
              />
            </div>

            <div className="dash-row dash-row-foot">
              <PrivacyCard privacy={privacy} tally={tally} connected={connected} />
              <DetailsCard
                contractAddress={contractAddress}
                shareUrl={props.shareUrl}
                networkId={props.networkId}
                options={tally?.counts.length ?? 0}
                activity={props.activity}
                copied={copied}
                onCopy={copy}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
