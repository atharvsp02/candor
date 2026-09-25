import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { DIRS, MANAGED, zkVersion } from './zk-version.mjs';

const version = zkVersion();
const root = join('public', 'zk', version);

rmSync(join('public', 'zk'), { recursive: true, force: true });
for (const dir of DIRS) {
  mkdirSync(join(root, dir), { recursive: true });
  cpSync(join(MANAGED, dir), join(root, dir), { recursive: true });
}

console.log(`zk artifacts at /zk/${version}`);
