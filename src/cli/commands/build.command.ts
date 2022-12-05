import { logInfo } from '../../logger/functions/log-info.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'build',
})
export class BuildCommand {
  public async handle(): Promise<void> {
    logInfo('Building started...');

    runCommand('tsc', {
      showOutput: true,
    });

    runCommand('copyfiles -u 1 src/**/*.html dist/');

    logInfo('Build successful');
  }
}
