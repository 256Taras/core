import chalk from 'chalk';
import { watch } from 'chokidar';
import { fork } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { env } from '../../configurator/functions/env.function.js';
import { logInfo } from '../../logger/functions/log-info.function.js';
import { cloneFiles } from '../../utils/functions/clone-files.function.js';
import { debounce } from '../../utils/functions/debounce.function.js';
import { runCommand } from '../../utils/functions/run-command.function.js';
import { Integer } from '../../utils/types/integer.type.js';
import { Command } from '../decorators/command.decorator.js';
import { WebClientAlias } from '../enums/web-client-alias.enum.js';
import { setupStdin } from '../functions/setup-stdin.function.js';

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

    logInfo(`Starting development server... ${chalk.gray(
      `[press ${chalk.white('q')} or ${chalk.white('esc')} to quit]`,
    )}`);

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
    const viewsWatcher = watch('src/**/*.html', watchOptions);

    let openedWebClient = false;

    serverTempWatcher.on('add', () => {
      if (flags.open && !openedWebClient) {
        runCommand(
          `${
            WebClientAlias[process.platform as 'darwin' | 'linux' | 'win32'] ??
            'xdg-open'
          } http://localhost:${env<Integer>('PORT') ?? 7000}`,
        );

        openedWebClient = true;
      }
    });

    let childProcess = fork(entryFile);

    const restartProcess = debounce(
      () => {
        console.clear();

        logInfo(
          `Reloading development server... ${chalk.gray(
            `[press ${chalk.white('q')} or ${chalk.white('esc')} to quit]`,
          )}`,
        );

        childProcess.kill();

        childProcess = fork(entryFile);
      },
      env<boolean>('DEVELOPER_MODE') ? 400 : 550,
    );

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

    viewsWatcher.on('all', async () => {
      await cloneFiles('src', 'dist', '.html');
    });

    envWatcher.on('all', restartProcess);

    setupStdin(async () => childProcess.kill());
  }
}
