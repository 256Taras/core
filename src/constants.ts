import { fileURLToPath } from 'node:url';
import { readJson } from './utils/functions/read-json.function.js';

export const NODE_VERSION = process.versions.node;
export const NORTHLE_VERSION = (
  await readJson(`${fileURLToPath(import.meta.url)}/../../package.json`)
).version as string;
