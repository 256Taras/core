import { readFile, writeFile } from 'node:fs/promises';
import { logInfo } from '../../logger/functions/log-info.function.js';
import { runCommand } from '../../utils/functions/run-command.function.js';
import { Command } from '../decorators/command.decorator.js';

@Command({
  signature: 'prepare:publish',
})
export class PreparePublishCommand {
  public async handle(): Promise<void> {
    logInfo('Preparing package for publishing...');

    runCommand('tsc', { showOutput: true });

    const cwd = process.cwd();

    const files = [
      `${cwd}/dist/database/database-client.class.js`,
      `${cwd}/dist/database/database-client.class.d.ts`,
    ];

    const replaces = [
      /import (.*?) from '.*?@prisma\/client.*?';/,
      `import $1 from '@prisma/client';`,
    ] as const;

    await Promise.all(
      files.map(async (file) => {
        const fileContent = await readFile(file, 'utf8');

        await writeFile(file, fileContent.replace(...replaces), 'utf8');
      }),
    );

    logInfo('Package is ready for publishing');
  }
}
