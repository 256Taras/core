import { env } from '../../configurator/functions/env.function.js';
import { logInfo } from '../../logger/functions/log-info.function.js';
import { logSub } from '../../logger/functions/log-sub.function.js';
import { cloneFiles } from '../../utils/functions/clone-files.function.js';
import { runCommand } from '../../utils/functions/run-command.function.js';
import { Command } from '../decorators/command.decorator.js';

@Command({
  signature: 'build',
})
export class BuildCommand {
  public async handle(): Promise<void> {
    logInfo('Building project...');
    logSub('Preparing dist...');

    runCommand(`tsc${env<boolean>('DEVELOPMENT') ? '' : ' --sourceMap=false'}`, {
      showOutput: true,
    });

    logSub('Copying assets...');

    await cloneFiles('src', 'dist', '.html');

    logInfo('Build complete');
  }
}
