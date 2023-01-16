import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function readJson(path: string): Promise<Record<string, any>> {
  if (!existsSync(path)) {
    throw new Error(`JSON file ${resolve(path)} does not exist`, {
      cause: new Error('Fix the path to the JSON file'),
    });
  }

  const content = await readFile(resolve(path));

  return JSON.parse(content.toString());
}
