import { info } from '../../logger/functions/info.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';
import { readFile, writeFile } from 'node:fs/promises';

@Command({
  signature: 'prepare:publish',
})
export class PreparePublishCommand {
  public async handle(): Promise<void> {
    info('Preparing package for publishing...');
    
    runCommand('tsc', true);

    const cwd = process.cwd();

    const files = [
      `${cwd}/dist/database/database-client.class.js`,
      `${cwd}/dist/database/database-client.class.d.ts`,
    ];

    const replaces = [
      /import (.*?) from '.*?@prisma\/client.*?';/,
      `import $1 from '@prisma/client';`,
    ] as const;

    await Promise.all(files.map(async (file) => {
      const fileContent = await readFile(file, 'utf8');

      await writeFile(
        file,
        fileContent.replace(...replaces),
      );
    }));

    info('Package is ready for publishing');
  }
}
