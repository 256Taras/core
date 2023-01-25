import chalk from 'chalk';
import { watch } from 'chokidar';
import { fork } from 'node:child_process';
import { tmpdir } from 'node:os';
import { logInfo } from '../../logger/functions/log-info.function';
import { cloneFiles } from '../../utils/functions/clone-files.function';
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
  public async handle(flags: Record<string, boolean>): Promise<void> {
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

    const sourceWatcher = watch('dist/**/*.js', watcherOptions);
    const viewWatcher = watch('src/**/*.html', watcherOptions);
    const envWatcher = watch('.env', watcherOptions);
    const serverTempWatcher = watch(serverTempPath);

    const openAliases: Record<string, string> = {
      darwin: 'open',
      linux: 'sensible-browser',
      win32: 'explorer',
    };

    serverTempWatcher.on('add', () => {
      if (flags.open) {
        runCommand(
          `${openAliases[process.platform] ?? 'xdg-open'} http://localhost:${
            env<number>('PORT') ?? 7000
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
    }, 550);

    sourceWatcher.on('all', async () => {
      restartProcess();

      await cloneFiles('src', 'dist', '.html');
    });

    if (env<boolean>('DEVELOPER_MODE')) {
      const frameworkWatcher = watch(
        'node_modules/@northle/core/dist',
        watcherOptions,
      );

      frameworkWatcher.on('change', restartProcess);
    }

    viewWatcher.on('all', async () => {
      await cloneFiles('src', 'dist', '.html');
    });

    envWatcher.on('all', restartProcess);

    setupStdin(async () => childProcess.kill());
  }
}
