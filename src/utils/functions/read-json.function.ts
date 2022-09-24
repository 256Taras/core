import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

export const readJson = async (path: string): Promise<Record<string, any>> => {
  if (!existsSync(path)) {
    throw new Error(`JSON file ${path} does not exist`);
  }

  const content = await readFile(path);

  return JSON.parse(content.toString());
};
