import { info } from '../../logger/functions/info.function';
import { debounce } from '../../utils/functions/debounce.function';
import { runCommand } from '../../utils/functions/run-command.function';
import { Command } from '../decorators/command.decorator';
import { watch } from 'chokidar';
import { fork } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';

@Command({
  signature: 'start:dev',
})
export class StartDev {
  public handle(): void {
    const entryFile = 'dist/main.js';

    const watcherOptions = {
      ignoreInitial: true,
      cwd: process.cwd(),
    };

    const sourceWatcher = watch('dist', watcherOptions);

    const internalWatcher = watch('node_modules/@norther/core/dist', watcherOptions);

    const viewWatcher = watch('src/**/*.html', watcherOptions);
    const envWatcher = watch('.env', watcherOptions);

    const processOptions = {
      execArgv: ['--experimental-specifier-resolution=node', '--no-warnings'],
    };

    let childProcess = fork(entryFile, processOptions);

    const restartProcess = debounce(() => {
      info('Restarting the server...');

      childProcess.kill();

      childProcess = fork(entryFile, processOptions);
    }, 680);

    sourceWatcher.on('all', () => {
      restartProcess();

      runCommand('copyfiles -u 1 src/**/*.html dist/');
    });

    internalWatcher.on('change', restartProcess);

    viewWatcher.on('all', () => {
      runCommand('copyfiles -u 1 src/**/*.html dist/');
    });

    envWatcher.on('all', restartProcess);

    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }

    process.stdin.resume();

    const exitKeys = {
      enter: 13,
      esc: 27,
      q: 113,
      any: NaN,
    };

    process.stdin.on('data', (data) => {
      const key = data.toString().trim().toLowerCase().charCodeAt(0);

      if ([...Object.values(exitKeys)].includes(key)) {
        info(
          `Server stopped [press ${
            process.platform === 'darwin' ? 'command' : 'ctrl'
          }+c to exit]`,
        );

        const tempPath = `${tmpdir()}/norther`;

        if (existsSync(tempPath)) {
          unlinkSync(tempPath);
        }

        childProcess.kill();

        process.exit();
      }
    });
  }
}
