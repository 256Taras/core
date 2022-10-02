import { fileURLToPath } from 'node:url';
import { readJson } from './utils/functions/read-json.function';

export const NODE_VERSION = process.versions.node;
export const VERSION = (
  await readJson(`${fileURLToPath(import.meta.url)}/../../package.json`)
).version;
