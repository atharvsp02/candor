import { useCallback, useEffect, useRef, useState } from 'react';
import semver from 'semver';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { Transaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { Contract, ledger, pureCircuits, type Ledger } from '../../managed/candor/contract/index.js';
import { browserPrivateStateProvider, loadOrCreateSecret } from '../browser-private-state';

const COMPATIBLE_WALLET_API = '4.x';
const PRIVATE_STATE_ID = 'candorPrivateState';

const NETWORK_ID = (import.meta.env.VITE_NETWORK_ID ?? 'preprod') as NetworkId;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? '';

export type Tally = {
  readonly enrolled: bigint;
  readonly cast: bigint;
  readonly counts: readonly bigint[];
  readonly spent: bigint;
};

export type Status =
  | { kind: 'disconnected' }
  | { kind: 'connecting' }
  | { kind: 'connected'; address: string }
  | { kind: 'error'; message: string };

const findWallet = (): InitialAPI | undefined => {
  const injected = (window as unknown as { midnight?: Record<string, unknown> }).midnight;
  if (!injected) return undefined;
  return Object.values(injected).find(
    (candidate): candidate is InitialAPI =>
      !!candidate &&
      typeof candidate === 'object' &&
      'apiVersion' in candidate &&
      semver.satisfies((candidate as InitialAPI).apiVersion, COMPATIBLE_WALLET_API),
  );
};

const readTally = (state: Ledger): Tally => ({
  enrolled: state.enrolled,
  cast: state.cast,
  spent: state.spent.size(),
  counts: Array.from({ length: Number(state.choices) }, (_, i) => state.tally.lookup(BigInt(i)).read()),
});

export const useMidnight = () => {
  const [status, setStatus] = useState<Status>({ kind: 'disconnected' });
  const [tally, setTally] = useState<Tally | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const deployed = useRef<any>(null);
  const publicData = useRef<any>(null);

  const refresh = useCallback(async () => {
    if (!publicData.current || !CONTRACT_ADDRESS) return;
    const state = await publicData.current.queryContractState(CONTRACT_ADDRESS);
    if (state) setTally(readTally(ledger(state.data)));
  }, []);

  useEffect(() => {
    if (!CONTRACT_ADDRESS) return;
    setNetworkId(NETWORK_ID);
    publicData.current = indexerPublicDataProvider(
      import.meta.env.VITE_INDEXER_URI ?? `https://indexer.${NETWORK_ID}.midnight.network/api/v4/graphql`,
      import.meta.env.VITE_INDEXER_WS_URI ?? `wss://indexer.${NETWORK_ID}.midnight.network/api/v4/graphql/ws`,
    );
    void refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    setStatus({ kind: 'connecting' });
    setNotice(null);
    try {
      const wallet = findWallet();
      if (!wallet) {
        throw new Error('No compatible Lace wallet found. Install the Midnight Lace extension and reload.');
      }

      let api: ConnectedAPI;
      try {
        api = await wallet.connect(NETWORK_ID);
      } catch {
        throw new Error('Connection was rejected in Lace.');
      }

      const config = await api.getConfiguration();
      const shielded = await api.getShieldedAddresses();

      setNetworkId(NETWORK_ID);
      const zkConfigProvider = new FetchZkConfigProvider(window.location.origin, fetch.bind(window));
      const providers = {
        privateStateProvider: browserPrivateStateProvider(),
        zkConfigProvider,
        proofProvider: httpClientProofProvider(config.proverServerUri!, zkConfigProvider),
        publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
        walletProvider: {
          getCoinPublicKey: () => shielded.shieldedCoinPublicKey,
          getEncryptionPublicKey: () => shielded.shieldedEncryptionPublicKey,
          balanceTx: async (tx: any) => {
            const balanced = await api.balanceUnsealedTransaction(toHex(tx.serialize()));
            return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
          },
        },
        midnightProvider: {
          submitTx: async (tx: any) => {
            await api.submitTransaction(toHex(tx.serialize()));
            return tx.identifiers()[0];
          },
        },
      };

      publicData.current = providers.publicDataProvider;

      const secret = loadOrCreateSecret();
      const witnesses = {
        memberSecret: ({ privateState }: any) => [privateState, privateState.secret],
        memberPath: ({ ledger: chain, privateState }: any) => {
          const leaf = pureCircuits.commitment(privateState.secret);
          const path = chain.roster.findPathForLeaf(leaf);
          if (path === undefined) throw new Error('This browser is not enrolled in the poll yet.');
          return [privateState, path];
        },
      };

      const CC = CompiledContract as any;
      const compiled = CC.withCompiledFileAssets(
        CC.withWitnesses(CompiledContract.make('candor', Contract), witnesses),
        '',
      );

      deployed.current = await findDeployedContract(providers as any, {
        compiledContract: compiled,
        contractAddress: CONTRACT_ADDRESS,
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: { secret },
      });

      const addresses = await api.getShieldedAddresses();
      setStatus({ kind: 'connected', address: addresses.shieldedCoinPublicKey.toString() });
      await refresh();
    } catch (error) {
      setStatus({ kind: 'error', message: error instanceof Error ? error.message : String(error) });
    }
  }, [refresh]);

  const disconnect = useCallback(() => {
    deployed.current = null;
    setStatus({ kind: 'disconnected' });
    setNotice(null);
  }, []);

  const run = useCallback(
    async (label: string, action: () => Promise<unknown>) => {
      setBusy(label);
      setNotice(null);
      try {
        await action();
        await refresh();
        setNotice(`${label} confirmed on chain.`);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : String(error));
      } finally {
        setBusy(null);
      }
    },
    [refresh],
  );

  const enrol = useCallback(() => run('Enrolment', () => deployed.current.callTx.enroll()), [run]);
  const vote = useCallback(
    (option: number) => run(`Ballot for option ${option}`, () => deployed.current.callTx.vote(BigInt(option))),
    [run],
  );

  return {
    status,
    tally,
    busy,
    notice,
    connect,
    disconnect,
    enrol,
    vote,
    refresh,
    contractAddress: CONTRACT_ADDRESS,
    networkId: NETWORK_ID,
  };
};
