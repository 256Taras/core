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

    if (env<boolean>('APP_DEBUG')) {
      warn('You are running production server in debug mode');
    }

    runCommand('node --experimental-specifier-resolution=node dist/main.js', true);
  }
}
