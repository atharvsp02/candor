import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMidnight } from '../hooks/useMidnight';
import { useLivePoll } from '../live/useLivePoll';
import { privacyView, tallyView } from '../view';
import { middle } from '../ui/format';
import { chainActivity, latestFirst } from './activity';
import { Dashboard, type ActivityEntry } from './Dashboard';
import '../styles/dash.css';

const CONFIRMED = ' confirmed on chain.';

export default function AppPage() {
  const m = useMidnight();
  const tally = useMemo(() => tallyView(m.tally), [m.tally]);
  const privacy = useMemo(() => privacyView(m.privacy), [m.privacy]);
  const [session, setSession] = useState<ActivityEntry[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const live = useLivePoll(m.contractAddress, refreshKey);
  const nextId = useRef(0);

  const log = useCallback((entry: Omit<ActivityEntry, 'id' | 'at'>) => {
    setSession((list) => [{ ...entry, id: `session-${nextId.current++}`, at: new Date() }, ...list].slice(0, 6));
  }, []);

  useEffect(() => {
    document.title = 'Candor · Poll';
  }, []);

  useEffect(() => {
    if (m.status.kind === 'connected') {
      log({ title: `Connected ${m.status.wallet}`, detail: middle(m.status.address, 10, 6), tone: 'info' });
    } else if (m.status.kind === 'error') {
      log({ title: 'Wallet connection failed', tone: 'bad' });
    }
  }, [m.status, log]);

  useEffect(() => {
    if (!m.notice) return;
    if (m.notice.endsWith(CONFIRMED)) {
      setRefreshKey((key) => key + 1);
    } else {
      log({ title: 'Transaction rejected', detail: m.notice, tone: 'bad' });
    }
  }, [m.notice, log]);

  const activity = useMemo(
    () => (live.events ? latestFirst([...session, ...chainActivity(live.events)]) : session.length ? session : null),
    [live.events, session],
  );

  const refresh = useCallback(() => {
    void m.refresh();
    setRefreshKey((key) => key + 1);
  }, [m]);

  return (
    <Dashboard
      status={m.status}
      tally={tally ?? live.tally}
      privacy={privacy}
      eligibility={m.eligibility}
      busy={m.busy}
      notice={m.notice}
      contractAddress={m.contractAddress}
      networkId={m.networkId}
      proverUri={m.proverUri}
      shareUrl={m.shareUrl}
      activity={activity}
      activityFailed={live.historyFailed}
      onConnect={m.connect}
      onDisconnect={m.disconnect}
      onCreatePoll={() => m.createPoll()}
      onIssue={() => m.issueCredential()}
      onEnrol={m.enrol}
      onVote={m.vote}
      onRefresh={refresh}
    />
  );
}
