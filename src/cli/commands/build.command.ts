import { logInfo } from '../../logger/functions/log-info.function';
import { logSub } from '../../logger/functions/log-sub.function';
import { cloneFiles } from '../../utils/functions/clone-files.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'build',
})
export class BuildCommand {
  public async handle(): Promise<void> {
    logInfo('Building project...');

    logSub('Copying assets...');
    logSub('Preparing dist...');

    runCommand('tsc', {
      showOutput: true,
    });

    await cloneFiles('src', 'dist', '.html');

    logInfo('Build successful');
  }
}
