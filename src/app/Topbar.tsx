import type { Status } from '../hooks/useMidnight';
import { BrandMark } from '../ui/Brand';
import { Check, Copy, Link, Power, Wallet } from '../ui/icons';
import { middle } from '../ui/format';

type Props = {
  status: Status;
  networkId: string;
  contractAddress: string;
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
};

const title = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function Topbar({
  status,
  networkId,
  contractAddress,
  shareUrl,
  copied,
  onCopy,
  onConnect,
  onDisconnect,
}: Props) {
  return (
    <header className="dash-top">
      <a className="top-mark" href="/" aria-label="Candor home">
        <BrandMark size={26} />
      </a>

      <div className="poll-field">
        <Link size={14} />
        <span className="poll-field-value">
          {contractAddress ? middle(contractAddress, 12, 8) : 'No poll selected'}
        </span>
        <button className="kbd" onClick={onCopy} disabled={!shareUrl} aria-label="Copy invite link">
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>

      <div className="top-end">
        <span className="chip chip-network">
          <span className="dot dot-live" />
          {title(networkId)}
        </span>

        {status.kind === 'connected' ? (
          <div className="wallet-chip">
            <Wallet size={15} />
            <span className="wallet-name">{status.wallet}</span>
            <code>{middle(status.address, 8, 4)}</code>
            <button className="icon-btn" onClick={onDisconnect} aria-label="Disconnect wallet" title="Disconnect">
              <Power size={14} />
            </button>
          </div>
        ) : (
          <button className="btn btn-light btn-sm" onClick={onConnect} disabled={status.kind === 'connecting'}>
            <Wallet size={15} />
            {status.kind === 'connecting' ? 'Connecting…' : 'Connect wallet'}
          </button>
        )}
      </div>
    </header>
  );
}
