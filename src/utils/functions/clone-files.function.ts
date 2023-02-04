import { existsSync, unlinkSync } from 'node:fs';
import { copyFile, lstat, mkdir, readdir } from 'node:fs/promises';

export async function cloneFiles(
  source: string,
  destination: string,
  extension: string,
) {
  const files = await readdir(source);

  await Promise.all(
    files.map(async (file) => {
      const stat = await lstat(`${source}/${file}`);
      const destinationPath = `${destination}/${file}`;

      if (stat.isDirectory()) {
        if (!existsSync(destinationPath)) {
          await mkdir(destinationPath);
        }

        await cloneFiles(`${source}/${file}`, destinationPath, extension);

        return;
      }

      if (file.endsWith(extension)) {
        if (existsSync(destinationPath)) {
          console.log(`Removing ${destinationPath}`);
          unlinkSync(destinationPath);
        }

        let copied = false;

        while (!copied) {
          try {
            await copyFile(`${source}/${file}`, destinationPath);

            copied = true;
          } catch {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }
      }
    }),
  );
}
