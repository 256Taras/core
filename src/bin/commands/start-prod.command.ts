import { info } from '../../logger/functions/info.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'start:prod',
})
export class StartProdCommand {
  public handle(): void {
    info('Starting production server...');

    runCommand('node --experimental-specifier-resolution=node dist/main.js', true);
  }
}
