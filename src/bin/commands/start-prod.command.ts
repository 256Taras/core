import chalk from 'chalk';
import { platform } from 'node:os';
import { env } from '../../utils/functions/env.function';
import { info } from '../../logger/functions/info.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { warn } from '../../logger/functions/warn.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'start:prod',
})
export class StartProdCommand {
  public handle(): void {
    info('Starting production server...');

    info(
      `Production server started ${chalk.gray(
        `[press ${chalk.white((platform() === 'darwin' ? 'command' : 'ctrl') + '+c')} to quit]`,
      )}`,
    );

    if (env<boolean>('APP_DEBUG')) {
      warn('You are running production server in debug mode');
    }

    runCommand('node --experimental-specifier-resolution=node --no-warnings dist/main', true);
  }
}
