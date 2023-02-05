import chalk from 'chalk';
import { fork } from 'node:child_process';
import { platform } from 'node:os';
import { createInterface } from 'node:readline/promises';
import { LOGGER_COLOR_ORANGE } from '../../logger/constants.js';
import { logInfo } from '../../logger/functions/log-info.function.js';
import { logWarning } from '../../logger/functions/log-warning.function.js';
import { env } from '../../utils/functions/env.function.js';
import { Command } from '../decorators/command.decorator.js';
import { setupStdin } from '../functions/setup-stdin.function.js';

@Command({
  signature: 'start:prod',
})
export class StartProdCommand {
  public async handle(): Promise<void> {
    logInfo('Starting production server...');

    logInfo(
      `Production server started ${chalk.gray(
        `[press ${chalk.white(
          (platform() === 'darwin' ? 'command' : 'ctrl') + '+c',
        )} to quit]`,
      )}`,
    );

    if (env<boolean>('DEVELOPMENT')) {
      logWarning('You are running production server in debug mode');
    }

    const childProcess = fork('dist/main.js');

    setupStdin(async () => {
      const { question, close } = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const reply = await question(
        chalk.hex(LOGGER_COLOR_ORANGE)('Are you sure you want to quit? (y/n) '),
      );

      close();

      if (['y', 'yes'].includes(reply.trim().toLowerCase())) {
        return true;
      }

      childProcess.kill();
    });
  }
}
