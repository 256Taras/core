import chalk from 'chalk';
import { fork } from 'node:child_process';
import { existsSync } from 'node:fs';
import { platform } from 'node:os';
import { createInterface } from 'node:readline/promises';
import { env } from '../../configurator/functions/env.function.js';
import { LOGGER_COLOR_ORANGE } from '../../logger/constants.js';
import { logError } from '../../logger/functions/log-error.function.js';
import { logInfo } from '../../logger/functions/log-info.function.js';
import { logSub } from '../../logger/functions/log-sub.function.js';
import { logWarning } from '../../logger/functions/log-warning.function.js';
import { Command } from '../decorators/command.decorator.js';
import { setupStdin } from '../functions/setup-stdin.function.js';

@Command({
  signatures: ['start:prod', 'start:production'],
})
export class StartProdCommand {
  public async handle(): Promise<void> {
    console.clear();

    logInfo('Starting production server...');

    logInfo(
      `Production server started ${chalk.gray(
        `[press ${chalk.white('q')} or ${chalk.white(
          `${platform() === 'darwin' ? 'cmd' : 'ctrl'}+c`,
        )} to quit]`,
      )}`,
    );

    if (env<boolean>('DEVELOPMENT')) {
      logWarning('You are running production server in development mode');

      logSub('Change .env variable DEVELOPMENT to false to enable production mode');
    }

    const entryFile = 'dist/main.js';

    if (!existsSync(entryFile)) {
      logError(
        `File ${entryFile} does not exist. Run 'npm run build' to build your project`,
      );

      process.exit(1);
    }

    const childProcess = fork(entryFile);

    setupStdin(async () => {
      const readlineInterface = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const reply = await readlineInterface.question(
        chalk.hex(LOGGER_COLOR_ORANGE)('Are you sure you want to quit? (y/n) '),
      );

      readlineInterface.close();

      if (['y', 'yes'].includes(reply.trim().toLowerCase())) {
        childProcess.kill();

        return true;
      }
    });
  }
}
