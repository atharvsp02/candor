import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';
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
        tally={m.tally}
        busy={m.busy}
        notice={m.notice}
        onEnrol={m.enrol}
        onVote={m.vote}
      />

      <section className="explain">
        <h2>What the chain learns</h2>
        <div className="grid">
          <div>
            <h3>Public</h3>
            <ul>
              <li>That a ballot was cast</li>
              <li>Which option it was for</li>
              <li>A 32-byte nullifier</li>
              <li>The roster of member commitments</li>
            </ul>
          </div>
          <div>
            <h3>Never leaves your browser</h3>
            <ul>
              <li>Your member secret</li>
              <li>Your Merkle path</li>
              <li>Which roster entry is yours</li>
              <li>Which ballot you cast</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="colophon">
        <span>Contract</span>
        <code>{m.contractAddress || 'not configured'}</code>
      </footer>
    </main>
  );
}
