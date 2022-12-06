import chalk from 'chalk';
import { watch } from 'chokidar';
import { fork } from 'node:child_process';
import { tmpdir } from 'node:os';
import { logInfo } from '../../logger/functions/log-info.function';
import { debounce } from '../../utils/functions/debounce.function';
import { env } from '../../utils/functions/env.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';
import { setupStdin } from '../functions/setup-stdin.function';

@Command({
  signature: 'server:dev',
  parameters: {
    open: {
      type: 'boolean',
      short: 'o',
      default: false,
    },
  },
})
export class ServerDevCommand {
  private readonly copyCommand = 'copyfiles -u 1 src/**/*.html dist/';

  public async handle(open: boolean): Promise<void> {
    const serverTempPath = `${tmpdir()}/northle/server`;

    logInfo(
      `Starting development server... ${chalk.gray(
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
    const serverTempWatcher = watch(serverTempPath);

    const browserAliases: Record<string, string> = {
      darwin: 'open',
      linux: 'sensible-browser',
      win32: 'explorer',
    };

    serverTempWatcher.on('add', () => {
      if (open) {
        runCommand(
          `${browserAliases[process.platform] ?? 'xdg-open'} http://localhost:${
            env<number>('PORT') ?? 8000
          }`,
        );
      }
    });

    const processOptions = {
      execArgv: ['--experimental-specifier-resolution=node', '--no-warnings'],
    };

    let childProcess = fork(entryFile, processOptions);

    const restartProcess = debounce(() => {
      logInfo('Reloading development server...');

      childProcess.kill();

      childProcess = fork(entryFile, processOptions);
    }, 560);

    sourceWatcher.on('all', () => {
      restartProcess();

      runCommand(this.copyCommand);
    });

    if (env<boolean>('DEVELOPER_MODE')) {
      const frameworkWatcher = watch(
        'node_modules/@northle/core/dist',
        watcherOptions,
      );

      frameworkWatcher.on('change', restartProcess);
    }

    viewWatcher.on('all', () => {
      runCommand(this.copyCommand);
    });

    envWatcher.on('all', restartProcess);

    setupStdin(() => childProcess.kill());
  }
}
