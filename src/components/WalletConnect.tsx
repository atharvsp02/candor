import type { Status } from '../hooks/useMidnight';

type Props = {
  status: Status;
  networkId: string;
  onConnect: () => void;
  onDisconnect: () => void;
};

const short = (value: string) => (value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value);

export function WalletConnect({ status, networkId, onConnect, onDisconnect }: Props) {
  if (status.kind === 'connected') {
    return (
      <div className="wallet">
        <div className="wallet-chip glass">
          <span className="dot dot-live" />
          <strong>{status.wallet}</strong>
          <code>{short(status.address)}</code>
          <button className="btn btn-glass btn-sm" onClick={onDisconnect}>
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet">
      <button className="btn btn-primary" onClick={onConnect} disabled={status.kind === 'connecting'}>
        {status.kind === 'connecting' ? 'Connecting…' : `Connect wallet · ${networkId}`}
      </button>
      {status.kind === 'error' && <p className="wallet-error glass">{status.message}</p>}
    </div>
  );
}
