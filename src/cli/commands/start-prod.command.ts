import chalk from 'chalk';
import { fork } from 'node:child_process';
import { platform } from 'node:os';
import { createInterface } from 'node:readline/promises';
import { inject } from '../../injector/functions/inject.function';
import { logInfo } from '../../logger/functions/log-info.function';
import { logWarning } from '../../logger/functions/log-warning.function';
import { Logger } from '../../logger/logger.class';
import { env } from '../../utils/functions/env.function';
import { Command } from '../decorators/command.decorator';
import { setupStdin } from '../functions/setup-stdin.function';

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

    const processOptions = {
      execArgv: ['--experimental-specifier-resolution=node', '--no-warnings'],
    };

    const childProcess = fork('dist/main.js', processOptions);

    setupStdin(async () => {
      const { question, close } = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const reply = await question(
        chalk.hex(inject(Logger).colorOrange)(
          'Are you sure you want to quit? (y/n) ',
        ),
      );

      close();

      if (['y', 'yes'].includes(reply.trim().toLowerCase())) {
        return true;
      }

      childProcess.kill();
    });
  }
}
