import type { Status } from '../hooks/useMidnight';

type Props = {
  status: Status;
  networkId: string;
  onConnect: () => void;
  onDisconnect: () => void;
};

const short = (value: string) => (value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value);

export function WalletConnect({ status, networkId, onConnect, onDisconnect }: Props) {
  return (
    <div className="wallet">
      {status.kind === 'connected' ? (
        <>
          <span className="dot dot-live" />
          <div className="wallet-meta">
            <strong>Lace connected</strong>
            <code>{short(status.address)}</code>
          </div>
          <button className="ghost" onClick={onDisconnect}>
            Disconnect
          </button>
        </>
      ) : (
        <>
          <span className={status.kind === 'error' ? 'dot dot-bad' : 'dot'} />
          <div className="wallet-meta">
            <strong>{status.kind === 'connecting' ? 'Connecting…' : 'Wallet not connected'}</strong>
            <code>network: {networkId}</code>
          </div>
          <button onClick={onConnect} disabled={status.kind === 'connecting'}>
            {status.kind === 'connecting' ? 'Connecting…' : 'Connect Lace'}
          </button>
        </>
      )}

      {status.kind === 'error' && <p className="error">{status.message}</p>}
    </div>
  );
}
