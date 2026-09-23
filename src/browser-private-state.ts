import type { ContractAddress, SigningKey } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import type {
  ImportPrivateStatesResult,
  ImportSigningKeysResult,
  PrivateStateExport,
  PrivateStateId,
  PrivateStateProvider,
  SigningKeyExport,
} from '@midnight-ntwrk/midnight-js-types';

const SECRET_KEY = 'candor:member-secret:v1';
const CREDENTIAL_KEY = 'candor:credential:v1';
const ISSUER_KEY = 'candor:issuer-secret:v1';

export type StoredCredential = {
  readonly tier: number;
  readonly blind: Uint8Array;
};

const encode = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

const decode = (value: string): Uint8Array => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

const scoped = (key: string, poll: string): string => `${key}:${poll.slice(0, 16)}`;

export const loadOrCreateSecret = (): Uint8Array => {
  const stored = localStorage.getItem(SECRET_KEY);
  if (stored) return decode(stored);
  const secret = crypto.getRandomValues(new Uint8Array(32));
  localStorage.setItem(SECRET_KEY, encode(secret));
  return secret;
};

export const forgetSecret = (): void => localStorage.removeItem(SECRET_KEY);

export const loadCredential = (poll: string): StoredCredential | undefined => {
  const stored = localStorage.getItem(scoped(CREDENTIAL_KEY, poll));
  if (!stored) return undefined;
  try {
    const { tier, blind } = JSON.parse(stored) as { tier: number; blind: string };
    return { tier, blind: decode(blind) };
  } catch {
    return undefined;
  }
};

export const saveCredential = (poll: string, credential: StoredCredential): void =>
  localStorage.setItem(
    scoped(CREDENTIAL_KEY, poll),
    JSON.stringify({ tier: credential.tier, blind: encode(credential.blind) }),
  );

export const loadIssuerSecret = (poll: string): Uint8Array | undefined => {
  const stored = localStorage.getItem(scoped(ISSUER_KEY, poll));
  return stored ? decode(stored) : undefined;
};

export const saveIssuerSecret = (poll: string, secret: Uint8Array): void =>
  localStorage.setItem(scoped(ISSUER_KEY, poll), encode(secret));

export const createIssuerSecret = (): Uint8Array => crypto.getRandomValues(new Uint8Array(32));

export const browserPrivateStateProvider = <PSI extends PrivateStateId, PS = unknown>(): PrivateStateProvider<
  PSI,
  PS
> => {
  const states = new Map<ContractAddress, Map<PSI, PS>>();
  const signingKeys = new Map<ContractAddress, SigningKey>();
  let address: ContractAddress | null = null;

  const current = (): ContractAddress => {
    if (address === null) throw new Error('Contract address not set');
    return address;
  };

  const scoped = (addr: ContractAddress): Map<PSI, PS> => {
    const existing = states.get(addr);
    if (existing) return existing;
    const created = new Map<PSI, PS>();
    states.set(addr, created);
    return created;
  };

  const unsupported = (what: string) => (): never => {
    throw new Error(`${what} is not supported in the browser provider`);
  };

  return {
    setContractAddress(next: ContractAddress) {
      address = next;
    },
    set: async (key, state) => void scoped(current()).set(key, state),
    get: async (key) => scoped(current()).get(key) ?? null,
    remove: async (key) => void scoped(current()).delete(key),
    clear: async () => void states.delete(current()),
    setSigningKey: async (addr, key) => void signingKeys.set(addr, key),
    getSigningKey: async (addr) => signingKeys.get(addr) ?? null,
    removeSigningKey: async (addr) => void signingKeys.delete(addr),
    clearSigningKeys: async () => void signingKeys.clear(),
    exportPrivateStates: unsupported('Exporting private state') as unknown as () => Promise<PrivateStateExport>,
    importPrivateStates: unsupported('Importing private state') as unknown as () => Promise<ImportPrivateStatesResult>,
    exportSigningKeys: unsupported('Exporting signing keys') as unknown as () => Promise<SigningKeyExport>,
    importSigningKeys: unsupported('Importing signing keys') as unknown as () => Promise<ImportSigningKeysResult>,
  };
};
