import { logInfo } from '../../logger/functions/log-info.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'db:seed',
})
export class DbSeedCommand {
  public async handle(): Promise<void> {
    logInfo('Running database seeding...');

    runCommand('npx prisma db seed', { showOutput: true });
  }
}
