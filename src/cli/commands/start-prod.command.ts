import chalk from 'chalk';
import { platform } from 'node:os';
import { info } from '../../logger/functions/info.function';
import { warn } from '../../logger/functions/warn.function';
import { env } from '../../utils/functions/env.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'start:prod',
})
export class StartProdCommand {
  public async handle(): Promise<void> {
    info('Starting production server...');

    info(
      `Production server started ${chalk.gray(
        `[press ${chalk.white(
          (platform() === 'darwin' ? 'command' : 'ctrl') + '+c',
        )} to quit]`,
      )}`,
    );

    if (env<boolean>('DEVELOPMENT')) {
      warn('You are running production server in debug mode');
    }

    runCommand(
      'node --experimental-specifier-resolution=node --no-warnings dist/main',
      { showOutput: true },
    );
  }
}
