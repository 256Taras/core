import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const NODE_VERSION = process.versions.node;
export const VERSION = JSON.parse(
  (
    await readFile(`${fileURLToPath(import.meta.url)}/../../package.json`)
  ).toString(),
).version;
