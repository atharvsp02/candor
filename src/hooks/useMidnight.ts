import { useCallback, useEffect, useRef, useState } from 'react';
import semver from 'semver';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
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
const OPTION_COUNT = 3n;

const NETWORK_ID = (import.meta.env.VITE_NETWORK_ID ?? 'preprod') as NetworkId;

/** A poll is one contract, so its address is the share link. */
const pollFromUrl = (): string =>
  new URLSearchParams(window.location.search).get('poll') ?? import.meta.env.VITE_CONTRACT_ADDRESS ?? '';

const putPollInUrl = (address: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.set('poll', address);
  window.history.replaceState({}, '', url);
};

export type Tally = {
  readonly enrolled: bigint;
  readonly cast: bigint;
  readonly counts: readonly bigint[];
  readonly spent: bigint;
};

/** What the chain can see about you, and what it cannot. Drives the privacy panel. */
export type PrivacyFacts = {
  readonly commitment: string;
  readonly nullifier: string;
  readonly enrolled: boolean;
  readonly voted: boolean;
  readonly anonymitySet: bigint;
};

export type Status =
  | { kind: 'disconnected' }
  | { kind: 'connecting' }
  | { kind: 'connected'; address: string }
  | { kind: 'error'; message: string };

const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

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
  const [contractAddress, setContractAddress] = useState<string>(pollFromUrl);
  const [tally, setTally] = useState<Tally | null>(null);
  const [privacy, setPrivacy] = useState<PrivacyFacts | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const providers = useRef<any>(null);
  const contract = useRef<any>(null);
  const secret = useRef<Uint8Array | null>(null);
  const publicData = useRef<any>(null);

  const readChain = useCallback(async (address: string) => {
    if (!publicData.current || !address) return;
    const state = await publicData.current.queryContractState(address);
    if (!state) return;
    const view = ledger(state.data);
    setTally(readTally(view));

    if (secret.current) {
      const commitment = pureCircuits.commitment(secret.current);
      const nullifier = pureCircuits.nullifier(secret.current);
      setPrivacy({
        commitment: hex(commitment),
        nullifier: hex(nullifier),
        enrolled: view.roster.findPathForLeaf(commitment) !== undefined,
        voted: view.spent.member(nullifier),
        anonymitySet: view.enrolled,
      });
    }
  }, []);

  useEffect(() => {
    setNetworkId(NETWORK_ID);
    publicData.current = indexerPublicDataProvider(
      import.meta.env.VITE_INDEXER_URI ?? `https://indexer.${NETWORK_ID}.midnight.network/api/v4/graphql`,
      import.meta.env.VITE_INDEXER_WS_URI ?? `wss://indexer.${NETWORK_ID}.midnight.network/api/v4/graphql/ws`,
    );
    if (contractAddress) void readChain(contractAddress);
  }, [contractAddress, readChain]);

  const buildProviders = useCallback(async (api: ConnectedAPI) => {
    const config = await api.getConfiguration();
    const shielded = await api.getShieldedAddresses();
    const zkConfigProvider = new FetchZkConfigProvider(window.location.origin, fetch.bind(window));

    return {
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
  }, []);

  const compiled = useCallback(() => {
    const sk = secret.current!;
    const witnesses = {
      memberSecret: ({ privateState }: any) => [privateState, privateState.secret],
      memberPath: ({ ledger: chain, privateState }: any) => {
        const leaf = pureCircuits.commitment(privateState.secret);
        const path = chain.roster.findPathForLeaf(leaf);
        if (path === undefined) throw new Error('This browser is not enrolled in the poll yet.');
        return [privateState, path];
      },
    };
    void sk;
    const CC = CompiledContract as any;
    return CC.withCompiledFileAssets(
      CC.withWitnesses(CompiledContract.make('candor', Contract), witnesses),
      '',
    );
  }, []);

  const connect = useCallback(async () => {
    setStatus({ kind: 'connecting' });
    setNotice(null);
    try {
      const wallet = findWallet();
      if (!wallet) {
        throw new Error('No compatible Midnight wallet found. Install the Lace extension, enable Midnight, and reload.');
      }

      let api: ConnectedAPI;
      try {
        api = await wallet.connect(NETWORK_ID);
      } catch {
        throw new Error('The wallet refused the connection. Approve it in the extension and try again.');
      }

      setNetworkId(NETWORK_ID);
      providers.current = await buildProviders(api);
      publicData.current = providers.current.publicDataProvider;
      secret.current = loadOrCreateSecret();

      if (contractAddress) {
        contract.current = await findDeployedContract(providers.current, {
          compiledContract: compiled(),
          contractAddress,
          privateStateId: PRIVATE_STATE_ID,
          initialPrivateState: { secret: secret.current },
        });
      }

      const shielded = await api.getShieldedAddresses();
      setStatus({ kind: 'connected', address: shielded.shieldedCoinPublicKey.toString() });
      if (contractAddress) await readChain(contractAddress);
    } catch (error) {
      setStatus({ kind: 'error', message: error instanceof Error ? error.message : String(error) });
    }
  }, [buildProviders, compiled, contractAddress, readChain]);

  const disconnect = useCallback(() => {
    contract.current = null;
    providers.current = null;
    setStatus({ kind: 'disconnected' });
    setPrivacy(null);
    setNotice(null);
  }, []);

  const run = useCallback(
    async (label: string, action: () => Promise<unknown>) => {
      setBusy(label);
      setNotice(null);
      try {
        await action();
        if (contractAddress) await readChain(contractAddress);
        setNotice(`${label} confirmed on chain.`);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : String(error));
      } finally {
        setBusy(null);
      }
    },
    [contractAddress, readChain],
  );

  const createPoll = useCallback(
    () =>
      run('Poll creation', async () => {
        const deployedContract = await deployContract(providers.current, {
          compiledContract: compiled(),
          args: [OPTION_COUNT],
          privateStateId: PRIVATE_STATE_ID,
          initialPrivateState: { secret: secret.current! },
        } as any);
        contract.current = deployedContract;
        const address = (deployedContract as any).deployTxData.public.contractAddress;
        setContractAddress(address);
        putPollInUrl(address);
        await readChain(address);
      }),
    [compiled, readChain, run],
  );

  const enrol = useCallback(() => run('Enrolment', () => contract.current.callTx.enroll()), [run]);

  const vote = useCallback(
    (option: number) =>
      run(`Ballot for option ${option}`, () => contract.current.callTx.vote(BigInt(option))),
    [run],
  );

  return {
    status,
    tally,
    privacy,
    busy,
    notice,
    contractAddress,
    shareUrl: contractAddress ? `${window.location.origin}${window.location.pathname}?poll=${contractAddress}` : '',
    networkId: NETWORK_ID,
    connect,
    disconnect,
    createPoll,
    enrol,
    vote,
    refresh: () => readChain(contractAddress),
  };
};
