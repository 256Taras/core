import { info } from '../../src/logger/functions/info.function';
import { runCommand } from '../../src/utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'db:migrate',
})
export class DbMigrateCommand {
  public handle(): void {
    info('Running database migrations...');

    runCommand('npx prisma migrate dev', true);
    runCommand('npx prisma generate', true);
  }
}
