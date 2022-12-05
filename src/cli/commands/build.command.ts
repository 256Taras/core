import { logInfo } from '../../logger/functions/log-info.function';
import { logSub } from '../../logger/functions/log-sub.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'build',
})
export class BuildCommand {
  public async handle(): Promise<void> {
    logInfo('Building app...');

    logSub('Copying assets...');

    runCommand('tsc', {
      showOutput: true,
    });

    runCommand('copyfiles -u 1 src/**/*.html dist/');

    logInfo('Build successful');
  }
}
