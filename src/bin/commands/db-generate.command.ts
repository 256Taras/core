import { info } from '../../logger/functions/info.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'db:generate',
})
export class DbGenerate {
  public handle(): void {
    info('Generating database client...');

    runCommand('npx prisma generate', true);
  }
}
