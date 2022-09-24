import { fileURLToPath } from 'node:url';
import { readJson } from './utils/functions/read-json.function';

export const NODE_VERSION = process.versions.node;
export const PACKAGE_DATA = await readJson(`${fileURLToPath(import.meta.url)}/../../package.json`);
export const VERSION = PACKAGE_DATA.version;
