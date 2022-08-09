import { fileURLToPath } from 'node:url';
import { promises } from 'node:fs';

export const NODE_VERSION = process.versions.node;
export const VERSION = JSON.parse(
  (
    await promises.readFile(`${fileURLToPath(import.meta.url)}/../../package.json`)
  ).toString(),
).version;
