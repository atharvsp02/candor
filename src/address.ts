import { Buffer } from 'buffer';
import { HDWallet, Roles, createKeystore } from '@midnight-ntwrk/wallet-sdk';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { resolveNetwork, getOrCreateWallet } from './network';

const { network, config } = resolveNetwork();
const { seed } = getOrCreateWallet(network);

setNetworkId(config.networkId);

const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
const derived = hdWallet.hdWallet.selectAccount(0).selectRoles([Roles.NightExternal]).deriveKeysAt(0);
if (derived.type !== 'keysDerived') throw new Error('Key derivation failed');
hdWallet.hdWallet.clear();

const address = createKeystore(derived.keys[Roles.NightExternal], getNetworkId()).getBech32Address();

console.log(`\n  Network: ${network}`);
console.log(`  Address: ${address}`);
if (config.faucet) console.log(`  Faucet:  ${config.faucet}`);
console.log();
