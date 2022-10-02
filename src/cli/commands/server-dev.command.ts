import chalk from 'chalk';
import { watch } from 'chokidar';
import { fork } from 'node:child_process';
import { info } from '../../logger/functions/info.function';
import { debounce } from '../../utils/functions/debounce.function';
import { env } from '../../utils/functions/env.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';
import { setupStdin } from '../functions/setup-stdin.function';

@Command({
  signature: 'server:dev',
})
export class ServerDevCommand {
  public handle(): void {
    info(
      `Development server started ${chalk.gray(
        `[press ${chalk.white('q')} or ${chalk.white('esc')} to quit]`,
      )}`,
    );

    const entryFile = 'dist/main.js';

    const watcherOptions = {
      ignoreInitial: true,
      cwd: process.cwd(),
    };

    const sourceWatcher = watch('dist', watcherOptions);
    const viewWatcher = watch('src/**/*.html', watcherOptions);
    const envWatcher = watch('.env', watcherOptions);

    const processOptions = {
      execArgv: ['--experimental-specifier-resolution=node', '--no-warnings'],
    };

    let childProcess = fork(entryFile, processOptions);

    const restartProcess = debounce(() => {
      info('Starting / restarting development server...');

      childProcess.kill();

      childProcess = fork(entryFile, processOptions);
    }, 680);

    sourceWatcher.on('all', () => {
      restartProcess();

      runCommand('copyfiles -u 1 src/**/*.html dist/');
    });

    if (env<boolean>('DEVELOPER_MODE')) {
      const frameworkWatcher = watch(
        'node_modules/@northle/core/dist',
        watcherOptions,
      );

      frameworkWatcher.on('change', restartProcess);
    }

    viewWatcher.on('all', () => {
      runCommand('copyfiles -u 1 src/**/*.html dist/');
    });

    envWatcher.on('all', restartProcess);

    setupStdin(() => childProcess.kill());
  }
}
