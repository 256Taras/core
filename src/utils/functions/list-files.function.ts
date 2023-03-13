import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function listFiles(directory: string): Promise<string[]> {
  const dirents = await readdir(directory, {
    withFileTypes: true,
  });

  const files = await Promise.all(
    dirents.map((dirent) => {
      const resolved = resolve(directory, dirent.name);

      return dirent.isDirectory() ? listFiles(resolved) : resolved;
    }),
  );

  return Array.prototype.concat(...files);
}
