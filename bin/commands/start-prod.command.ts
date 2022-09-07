import chalk from 'chalk';
import { platform } from 'node:os';
import { info } from '../../src/logger/functions/info.function';
import { warn } from '../../src/logger/functions/warn.function';
import { env } from '../../src/utils/functions/env.function';
import { runCommand } from '../../src/utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'start:prod',
})
export class StartProdCommand {
  public handle(): void {
    info('Starting production server...');

    info(
      `Production server started ${chalk.gray(
        `[press ${chalk.white(
          (platform() === 'darwin' ? 'command' : 'ctrl') + '+c',
        )} to quit]`,
      )}`,
    );

    if (env<boolean>('NORTHER_DEV')) {
      warn('You are running production server in debug mode');
    }

    runCommand(
      'node --experimental-specifier-resolution=node --no-warnings dist/main',
      true,
    );
  }
}
