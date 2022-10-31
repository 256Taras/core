import { logInfo } from '../../logger/functions/log-info.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'db:migrate',
})
export class DbMigrateCommand {
  public async handle(): Promise<void> {
    logInfo('Running database migrations...');

    runCommand('npx prisma migrate dev', { showOutput: true });
    runCommand('npx prisma generate', { showOutput: true });
  }
}
