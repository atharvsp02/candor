const NETWORK = import.meta.env.VITE_NETWORK_ID ?? 'preprod';

export const POLL_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? '';
export const NETWORK_ID = NETWORK;

const INDEXER_URI = import.meta.env.VITE_INDEXER_URI ?? `https://indexer.${NETWORK}.midnight.network/api/v4/graphql`;
const INDEXER_WS_URI =
  import.meta.env.VITE_INDEXER_WS_URI ?? `wss://indexer.${NETWORK}.midnight.network/api/v4/graphql/ws`;

export type ChainEvent = {
  readonly kind: 'deploy' | 'enroll' | 'vote' | 'update';
  readonly height: number;
  readonly at: Date;
  readonly hash: string;
};

export type LatestAction = {
  readonly state: string;
  readonly hash: string;
  readonly height: number;
  readonly at: Date;
};

type RawAction = {
  __typename: 'ContractDeploy' | 'ContractCall' | 'ContractUpdate';
  entryPoint?: string;
  state?: string;
  transaction: { hash: string; block: { height: number; timestamp: number } };
};

const LATEST_QUERY = `query Latest($address: HexEncoded!) {
  contractAction(address: $address) {
    state
    transaction { hash block { height timestamp } }
  }
}`;

const HISTORY_SUBSCRIPTION = `subscription History($address: HexEncoded!, $offset: BlockOffset) {
  contractActions(address: $address, offset: $offset) {
    __typename
    transaction { hash block { height timestamp } }
    ... on ContractCall { entryPoint }
  }
}`;

const toEvent = (action: RawAction): ChainEvent => ({
  kind:
    action.__typename === 'ContractDeploy'
      ? 'deploy'
      : action.__typename === 'ContractUpdate'
        ? 'update'
        : action.entryPoint === 'vote'
          ? 'vote'
          : 'enroll',
  height: action.transaction.block.height,
  at: new Date(action.transaction.block.timestamp),
  hash: action.transaction.hash,
});

export const fetchLatest = async (address: string, signal?: AbortSignal): Promise<LatestAction | null> => {
  const response = await fetch(INDEXER_URI, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: LATEST_QUERY, variables: { address } }),
    signal,
  });
  if (!response.ok) throw new Error(`The indexer responded with ${response.status}.`);
  const { data, errors } = (await response.json()) as {
    data?: { contractAction: RawAction | null };
    errors?: { message: string }[];
  };
  if (errors?.length) throw new Error(errors[0].message);
  const action = data?.contractAction;
  if (!action?.state) return null;
  return {
    state: action.state,
    hash: action.transaction.hash,
    height: action.transaction.block.height,
    at: new Date(action.transaction.block.timestamp),
  };
};

export const fetchHistory = (address: string, untilHash: string, signal?: AbortSignal, timeoutMs = 12000) =>
  new Promise<ChainEvent[]>((resolve, reject) => {
    const events: ChainEvent[] = [];
    const socket = new WebSocket(INDEXER_WS_URI, 'graphql-transport-ws');
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      socket.close();
      if (error && events.length === 0) reject(error);
      else resolve(events);
    };
    const abort = () => finish(new Error('Cancelled.'));
    const timer = window.setTimeout(() => finish(new Error('The indexer took too long to answer.')), timeoutMs);
    signal?.addEventListener('abort', abort);

    socket.onopen = () => socket.send(JSON.stringify({ type: 'connection_init' }));
    socket.onerror = () => finish(new Error('Could not reach the indexer.'));
    socket.onclose = () => finish(new Error('The indexer closed the connection.'));
    socket.onmessage = (message) => {
      const packet = JSON.parse(String(message.data)) as {
        type: string;
        payload?: { data?: { contractActions?: RawAction } } | { message: string }[];
      };
      if (packet.type === 'connection_ack') {
        socket.send(
          JSON.stringify({
            id: 'history',
            type: 'subscribe',
            payload: { query: HISTORY_SUBSCRIPTION, variables: { address, offset: { height: 0 } } },
          }),
        );
      } else if (packet.type === 'next' && packet.payload && !Array.isArray(packet.payload)) {
        const action = packet.payload.data?.contractActions;
        if (!action) return;
        events.push(toEvent(action));
        if (action.transaction.hash === untilHash) finish();
      } else if (packet.type === 'error' || packet.type === 'complete') {
        finish(new Error('The indexer ended the history stream.'));
      }
    };
  });
