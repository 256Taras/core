import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const NODE_VERSION = process.versions.node;
export const VERSION = JSON.parse((await promises.readFile(`${fileURLToPath(import.meta.url)}/../../package.json`)).toString()).version;
