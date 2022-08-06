import { Command } from '../decorators/command.decorator.js';
import { info } from '../../utils/functions/info.function.js';
import { runCommand } from '../../utils/functions/run-command.function.js';

@Command({
  signature: 'start:prod',
})
export class StartProd {
  public handle(): void {
    info('Starting production server...');

    runCommand('node --experimental-specifier-resolution=node dist/main.js', true);
  }
};
