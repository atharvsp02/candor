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
import {
  browserPrivateStateProvider,
  createIssuerSecret,
  loadCredential,
  loadIssuerSecret,
  loadOrCreateSecret,
  saveCredential,
  saveIssuerSecret,
  type StoredCredential,
} from '../browser-private-state';

const COMPATIBLE_WALLET_API = '4.x';
const PRIVATE_STATE_ID = 'candorPrivateState';
const OPTION_COUNT = 3n;
const DEFAULT_THRESHOLD = 1n;
const DEFAULT_TIER = 2;

const NETWORK_ID = (import.meta.env.VITE_NETWORK_ID ?? 'preprod') as NetworkId;

const PROOF_SERVER_OVERRIDE = import.meta.env.VITE_PROOF_SERVER_URI ?? '';

const TRANSIENT_SUBMIT = /submitting scoped transaction|request failed|failed to fetch|network|timeout|504|502|503/i;

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

export type PrivacyFacts = {
  readonly commitment: string;
  readonly nullifier: string;
  readonly enrolled: boolean;
  readonly voted: boolean;
  readonly anonymitySet: bigint;
  readonly credentialLeaf?: string;
  readonly credentialIssued: boolean;
};

export type Eligibility = {
  readonly minTier: bigint;
  readonly issued: bigint;
  readonly holdsCredential: boolean;
  readonly tier?: number;
  readonly meetsThreshold: boolean;
  readonly isIssuer: boolean;
};

export type Status =
  | { kind: 'disconnected' }
  | { kind: 'connecting' }
  | { kind: 'connected'; address: string; wallet: string }
  | { kind: 'error'; message: string };

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

const findWallet = (): { api: InitialAPI; name: string } | undefined => {
  const injected = (window as unknown as { midnight?: Record<string, unknown> }).midnight;
  if (!injected) return undefined;
  const entry = Object.entries(injected).find(
    ([, candidate]) =>
      !!candidate &&
      typeof candidate === 'object' &&
      'apiVersion' in candidate &&
      semver.satisfies((candidate as InitialAPI).apiVersion, COMPATIBLE_WALLET_API),
  );
  if (!entry) return undefined;
  const [key, candidate] = entry;
  const named = candidate as InitialAPI & { name?: string };
  return { api: named, name: named.name ?? key };
};

const readTally = (state: Ledger): Tally => ({
  enrolled: state.enrolled,
  cast: state.cast,
  spent: state.spent.size(),
  counts: Array.from({ length: Number(state.choices) }, (_, i) => state.tally.lookup(BigInt(i)).read()),
});

const credentialLeafFor = (commitment: Uint8Array, credential: StoredCredential): Uint8Array =>
  pureCircuits.credentialLeaf(commitment, BigInt(credential.tier), credential.blind);

export const useMidnight = () => {
  const [status, setStatus] = useState<Status>({ kind: 'disconnected' });
  const [contractAddress, setContractAddress] = useState<string>(pollFromUrl);
  const [tally, setTally] = useState<Tally | null>(null);
  const [privacy, setPrivacy] = useState<PrivacyFacts | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [proverUri, setProverUri] = useState<string>(PROOF_SERVER_OVERRIDE);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [retrying, setRetrying] = useState(false);

  const providers = useRef<any>(null);
  const contract = useRef<any>(null);
  const secret = useRef<Uint8Array | null>(null);
  const publicData = useRef<any>(null);
  const credential = useRef<StoredCredential | undefined>(undefined);
  const issuerSecret = useRef<Uint8Array | undefined>(undefined);

  const readChain = useCallback(async (address: string) => {
    if (!publicData.current || !address) return;
    const state = await publicData.current.queryContractState(address);
    if (!state) return;
    const view = ledger(state.data);
    setTally(readTally(view));

    const heldCredential = credential.current;
    const issuerKey = issuerSecret.current;
    setEligibility({
      minTier: view.minTier,
      issued: view.issued,
      holdsCredential: heldCredential !== undefined,
      tier: heldCredential?.tier,
      meetsThreshold: heldCredential !== undefined && BigInt(heldCredential.tier) >= view.minTier,
      isIssuer: issuerKey !== undefined && hex(pureCircuits.issuerKeyOf(issuerKey)) === hex(view.issuer),
    });

    if (secret.current) {
      const commitment = pureCircuits.commitment(secret.current);
      const nullifier = pureCircuits.nullifier(secret.current);
      const leaf = heldCredential ? credentialLeafFor(commitment, heldCredential) : undefined;
      setPrivacy({
        commitment: hex(commitment),
        nullifier: hex(nullifier),
        enrolled: view.roster.findPathForLeaf(commitment) !== undefined,
        voted: view.spent.member(nullifier),
        anonymitySet: view.enrolled,
        credentialLeaf: leaf ? hex(leaf) : undefined,
        credentialIssued: leaf !== undefined && view.credentials.findPathForLeaf(leaf) !== undefined,
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
    const zkConfigProvider = new FetchZkConfigProvider(`${window.location.origin}/zk/${__ZK_VERSION__}`, fetch.bind(window));
    const prover = PROOF_SERVER_OVERRIDE || config.proverServerUri || 'http://localhost:6300';
    setProverUri(prover);

    return {
      privateStateProvider: browserPrivateStateProvider(),
      zkConfigProvider,
      proofProvider: httpClientProofProvider(prover, zkConfigProvider),
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

  const privateState = useCallback(
    () => ({
      secret: secret.current!,
      credential: credential.current,
      issuerSecret: issuerSecret.current,
    }),
    [],
  );

  // The SDK keeps its own copy of the private state, so a credential picked up
  // after the contract was attached has to be written back or the witnesses
  // will not see it.
  const syncPrivateState = useCallback(async () => {
    const provider = providers.current?.privateStateProvider;
    if (!provider) return;
    await provider.set(PRIVATE_STATE_ID, privateState());
  }, [privateState]);

  const compiled = useCallback(() => {
    const sk = secret.current!;
    const witnesses = {
      memberSecret: ({ privateState }: any) => [privateState, privateState.secret],
      memberTier: ({ privateState }: any) => {
        if (!privateState.credential) throw new Error('This browser holds no credential for the poll.');
        return [privateState, BigInt(privateState.credential.tier)];
      },
      credentialBlind: ({ privateState }: any) => {
        if (!privateState.credential) throw new Error('This browser holds no credential for the poll.');
        return [privateState, privateState.credential.blind];
      },
      credentialPath: ({ ledger: chain, privateState }: any) => {
        if (!privateState.credential) throw new Error('This browser holds no credential for the poll.');
        const leaf = credentialLeafFor(pureCircuits.commitment(privateState.secret), privateState.credential);
        const path = chain.credentials.findPathForLeaf(leaf);
        if (path === undefined) throw new Error('No credential has been issued to this browser yet.');
        return [privateState, path];
      },
      memberPath: ({ ledger: chain, privateState }: any) => {
        const leaf = pureCircuits.commitment(privateState.secret);
        const path = chain.roster.findPathForLeaf(leaf);
        if (path === undefined) throw new Error('This browser is not enrolled in the poll yet.');
        return [privateState, path];
      },
      issuerSecret: ({ privateState }: any) => {
        if (!privateState.issuerSecret) throw new Error('This browser does not hold the issuer key for the poll.');
        return [privateState, privateState.issuerSecret];
      },
    };
    void sk;
    const CC = CompiledContract as any;
    return CC.withCompiledFileAssets(CC.withWitnesses(CompiledContract.make('candor', Contract), witnesses), '');
  }, []);

  const connect = useCallback(async () => {
    setStatus({ kind: 'connecting' });
    setNotice(null);
    try {
      const wallet = findWallet();
      if (!wallet) {
        throw new Error('No compatible Midnight wallet found. Install Lace or 1AM, enable Midnight, and reload.');
      }

      let api: ConnectedAPI;
      try {
        api = await wallet.api.connect(NETWORK_ID);
      } catch (cause) {
        const detail = cause instanceof Error ? cause.message : String(cause);
        throw new Error(
          `The wallet refused the connection: ${detail}. Unlock Lace, approve the request for this site, and try again.`,
        );
      }

      setNetworkId(NETWORK_ID);
      providers.current = await buildProviders(api);
      publicData.current = providers.current.publicDataProvider;
      secret.current = loadOrCreateSecret();

      if (contractAddress) {
        credential.current = loadCredential(contractAddress);
        issuerSecret.current = loadIssuerSecret(contractAddress);
        contract.current = await findDeployedContract(providers.current, {
          compiledContract: compiled(),
          contractAddress,
          privateStateId: PRIVATE_STATE_ID,
          initialPrivateState: privateState(),
        });
        await syncPrivateState();
      }

      const shielded = await api.getShieldedAddresses();
      setStatus({ kind: 'connected', address: shielded.shieldedCoinPublicKey.toString(), wallet: wallet.name });
      if (contractAddress) await readChain(contractAddress);
    } catch (error) {
      setStatus({ kind: 'error', message: error instanceof Error ? error.message : String(error) });
    }
  }, [buildProviders, compiled, contractAddress, privateState, readChain, syncPrivateState]);

  const disconnect = useCallback(() => {
    contract.current = null;
    providers.current = null;
    setStatus({ kind: 'disconnected' });
    setPrivacy(null);
    setNotice(null);
  }, []);

  const submit = useCallback(async <T,>(send: () => Promise<T>): Promise<T> => {
    try {
      return await send();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!TRANSIENT_SUBMIT.test(message)) throw error;
      setRetrying(true);
      try {
        return await send();
      } finally {
        setRetrying(false);
      }
    }
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
        setRetrying(false);
      }
    },
    [contractAddress, readChain],
  );

  const createPoll = useCallback(
    (threshold: bigint = DEFAULT_THRESHOLD) =>
      run('Poll creation', async () => {
        const key = createIssuerSecret();
        issuerSecret.current = key;
        credential.current = undefined;
        const deployedContract = await deployContract(providers.current, {
          compiledContract: compiled(),
          args: [OPTION_COUNT, threshold, pureCircuits.issuerKeyOf(key)],
          privateStateId: PRIVATE_STATE_ID,
          initialPrivateState: privateState(),
        } as any);
        contract.current = deployedContract;
        const address = (deployedContract as any).deployTxData.public.contractAddress;
        saveIssuerSecret(address, key);
        await syncPrivateState();
        setContractAddress(address);
        putPollInUrl(address);
        await readChain(address);
      }),
    [compiled, privateState, readChain, run, syncPrivateState],
  );

  const issueCredential = useCallback(
    (tier: number = DEFAULT_TIER, holder?: string) =>
      run(`Credential for tier ${tier}`, async () => {
        if (!issuerSecret.current) throw new Error('This browser does not hold the issuer key for the poll.');
        const blind = crypto.getRandomValues(new Uint8Array(32));
        const issuedTo = holder
          ? Uint8Array.from(holder.match(/../g) ?? [], (pair) => Number.parseInt(pair, 16))
          : pureCircuits.commitment(secret.current!);
        const leaf = credentialLeafFor(issuedTo, { tier, blind });
        await submit(() => contract.current.callTx.issue(leaf));
        if (!holder) {
          credential.current = { tier, blind };
          saveCredential(contractAddress, { tier, blind });
          await syncPrivateState();
        }
      }),
    [contractAddress, run, submit, syncPrivateState],
  );

  const enrol = useCallback(
    () => run('Enrolment', () => submit(() => contract.current.callTx.enroll())),
    [run, submit],
  );

  const vote = useCallback(
    (option: number) =>
      run(`Ballot for option ${option}`, () => submit(() => contract.current.callTx.vote(BigInt(option)))),
    [run, submit],
  );

  return {
    status,
    tally,
    privacy,
    eligibility,
    busy,
    retrying,
    notice,
    contractAddress,
    proverUri,
    shareUrl: contractAddress ? `${window.location.origin}${window.location.pathname}?poll=${contractAddress}` : '',
    networkId: NETWORK_ID,
    connect,
    disconnect,
    createPoll,
    issueCredential,
    enrol,
    vote,
    refresh: () => readChain(contractAddress),
  };
};
