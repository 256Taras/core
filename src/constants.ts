import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const NODE_VERSION = process.versions.node;
export const PACKAGE_DATA = JSON.parse(
  (
    await readFile(`${fileURLToPath(import.meta.url)}/../../package.json`)
  ).toString(),
);
export const VERSION = PACKAGE_DATA.version;
