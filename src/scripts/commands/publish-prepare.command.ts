import { readFile, writeFile } from 'node:fs/promises';
import { logInfo } from '../../logger/functions/log-info.function.js';
import { runCommand } from '../../utils/functions/run-command.function.js';
import { Command } from '../decorators/command.decorator.js';

@Command({
  signature: 'publish:prepare',
})
export class PublishPrepareCommand {
  public async handle(): Promise<void> {
    logInfo('Preparing package for publishing...');

    runCommand('yarn build', {
      showOutput: true,
    });

    const cwd = process.cwd();

    const databaseImportsFiles = [
      `${cwd}/dist/database/database-client.service.js`,
      `${cwd}/dist/database/database-client.service.d.ts`,
    ];

    await Promise.all(
      databaseImportsFiles.map(async (file) => {
        const fileContent = await readFile(file, 'utf8');

        await writeFile(
          file,
          fileContent.replace(
            /import (.*?) from '.*?@prisma\/client.*?';/,
            `import $1 from '@prisma/client';`,
          ),
          'utf8',
        );
      }),
    );

    logInfo('Package is ready for publishing');
  }
}
