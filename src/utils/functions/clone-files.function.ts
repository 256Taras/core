import { copyFile, lstat, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export const cloneFiles = async (source: string, destination: string, extension: string) => {
  const files = await readdir(source);

  await Promise.all(files.map(async (file) => {
    const stat = await lstat(`${source}/${file}`);

    if (stat.isDirectory()) {
      if (!existsSync(`${destination}/${file}`)) {
        await mkdir(`${destination}/${file}`);
      }

      await cloneFiles(`${source}/${file}`, `${destination}/${file}`, extension);

      return;
    }

    if (file.endsWith(extension)) {
      await copyFile(`${source}/${file}`, `${destination}/${file}`);
    }
  }));
};
