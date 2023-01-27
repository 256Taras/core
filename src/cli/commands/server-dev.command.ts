import chalk from 'chalk';
import { watch } from 'chokidar';
import { fork } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { logInfo } from '../../logger/functions/log-info.function';
import { cloneFiles } from '../../utils/functions/clone-files.function';
import { debounce } from '../../utils/functions/debounce.function';
import { env } from '../../utils/functions/env.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';
import { WebClientAlias } from '../enums/web-client-alias.enum';
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

    if (!existsSync(serverTempPath)) {
      await mkdir(serverTempPath, {
        recursive: true,
      });
    }

    const watchOptions = {
      ignoreInitial: true,
      cwd: process.cwd(),
    };

    const envWatcher = watch('.env', watchOptions);
    const serverTempWatcher = watch(serverTempPath);
    const sourceWatcher = watch('dist/**/*.js', watchOptions);
    const viewWatcher = watch('src/**/*.html', watchOptions);

    let openedWebClient = false;

    serverTempWatcher.on('add', () => {
      if (flags.open && !openedWebClient) {
        runCommand(
          `${
            WebClientAlias[process.platform as 'darwin' | 'linux' | 'win32'] ??
            'xdg-open'
          } http://localhost:${env<number>('PORT') ?? 7000}`,
        );

        openedWebClient = true;
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
        watchOptions,
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
