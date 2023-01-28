import { logInfo } from '../../logger/functions/log-info.function.js';
import { runCommand } from '../../utils/functions/run-command.function.js';
import { Command } from '../decorators/command.decorator.js';

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
