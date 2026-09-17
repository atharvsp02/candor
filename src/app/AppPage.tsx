import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMidnight } from '../hooks/useMidnight';
import { privacyView, tallyView } from '../view';
import { middle } from '../ui/format';
import { Dashboard, type ActivityEntry } from './Dashboard';
import '../styles/dash.css';

const CONFIRMED = ' confirmed on chain.';

export default function AppPage() {
  const m = useMidnight();
  const tally = useMemo(() => tallyView(m.tally), [m.tally]);
  const privacy = useMemo(() => privacyView(m.privacy), [m.privacy]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const nextId = useRef(0);

  const log = useCallback((entry: Omit<ActivityEntry, 'id' | 'at'>) => {
    setActivity((list) => [{ ...entry, id: nextId.current++, at: new Date() }, ...list].slice(0, 5));
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
      log({ title: `${m.notice.slice(0, -CONFIRMED.length)} confirmed`, detail: 'accepted on chain', tone: 'ok' });
    } else {
      log({ title: 'Transaction rejected', detail: m.notice, tone: 'bad' });
    }
  }, [m.notice, log]);

  return (
    <Dashboard
      status={m.status}
      tally={tally}
      privacy={privacy}
      busy={m.busy}
      notice={m.notice}
      contractAddress={m.contractAddress}
      networkId={m.networkId}
      proverUri={m.proverUri}
      shareUrl={m.shareUrl}
      activity={activity}
      onConnect={m.connect}
      onDisconnect={m.disconnect}
      onCreatePoll={m.createPoll}
      onEnrol={m.enrol}
      onVote={m.vote}
      onRefresh={() => void m.refresh()}
    />
  );
}
