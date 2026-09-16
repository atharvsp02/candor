import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';
import { PrivacyProof } from './components/PrivacyProof';
import { useMidnight } from './hooks/useMidnight';
import './App.css';

export default function App() {
  const m = useMidnight();
  const connected = m.status.kind === 'connected';

  return (
    <main>
      <header className="masthead">
        <div>
          <h1>Candor</h1>
          <p>Anonymous polling where the anonymity is proven, not promised.</p>
        </div>
        <WalletConnect
          status={m.status}
          networkId={m.networkId}
          onConnect={m.connect}
          onDisconnect={m.disconnect}
        />
      </header>

      <CircuitCall
        connected={connected}
        hasPoll={Boolean(m.contractAddress)}
        shareUrl={m.shareUrl}
        onCreatePoll={m.createPoll}
        tally={m.tally}
        busy={m.busy}
        notice={m.notice}
        onEnrol={m.enrol}
        onVote={m.vote}
      />

      <PrivacyProof privacy={m.privacy} />


      <footer className="colophon">
        <span>Contract</span>
        <code>{m.contractAddress || 'not configured'}</code>
        {m.proverUri && (
          <>
            <span>Proving at</span>
            <code>{m.proverUri}</code>
          </>
        )}
      </footer>
    </main>
  );
}
