import { logInfo } from '../../logger/functions/log-info.function.js';
import { runCommand } from '../../utils/functions/run-command.function.js';
import { Command } from '../decorators/command.decorator.js';

@Command({
  signature: 'db:seed',
})
export class DbSeedCommand {
  public async handle(): Promise<void> {
    logInfo('Running database seeding...');

    runCommand('npx prisma db seed', { showOutput: true });
  }
}
