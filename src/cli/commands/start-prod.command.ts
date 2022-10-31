import chalk from 'chalk';
import { platform } from 'node:os';
import { logInfo } from '../../logger/functions/log-info.function';
import { logWarning } from '../../logger/functions/log-warning.function';
import { env } from '../../utils/functions/env.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';

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

    runCommand(
      'node --experimental-specifier-resolution=node --no-warnings dist/main',
      { showOutput: true },
    );
  }
}
