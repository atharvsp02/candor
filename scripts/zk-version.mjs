import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MANAGED = 'managed/candor';
const DIRS = ['keys', 'zkir'];

export function zkVersion() {
  const hash = createHash('sha256');
  for (const dir of DIRS) {
    for (const name of readdirSync(join(MANAGED, dir)).sort()) {
      hash.update(name);
      hash.update(readFileSync(join(MANAGED, dir, name)));
    }
  }
  return hash.digest('hex').slice(0, 16);
}

export { MANAGED, DIRS };
