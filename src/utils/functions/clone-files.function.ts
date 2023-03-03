import { existsSync } from 'node:fs';
import { copyFile, lstat, mkdir, readdir, unlink } from 'node:fs/promises';

export async function cloneFiles(
  source: string,
  destination: string,
  extension?: string,
) {
  const files = await readdir(source);

  await Promise.all(
    files.map(async (file) => {
      const stat = await lstat(`${source}/${file}`);
      const destinationPath = `${destination}/${file}`;

      if (stat.isDirectory()) {
        if (!existsSync(destinationPath)) {
          let created = false;

          while (!created) {
            try {
              await mkdir(destinationPath);

              created = true;
            } catch {
              await new Promise((resolve) => setTimeout(resolve, 40));
            }
          }
        }

        await cloneFiles(`${source}/${file}`, destinationPath, extension);

        return;
      }

      if (!extension || file.endsWith(extension)) {
        if (existsSync(destinationPath)) {
          let deleted = false;

          while (!deleted) {
            try {
              await unlink(destinationPath);

              deleted = true;
            } catch {
              await new Promise((resolve) => setTimeout(resolve, 40));
            }
          }
        }

        let copied = false;

        while (!copied) {
          try {
            await copyFile(`${source}/${file}`, destinationPath);

            copied = true;
          } catch {
            await new Promise((resolve) => setTimeout(resolve, 40));
          }
        }
      }
    }),
  );
}
