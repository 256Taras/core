#!/usr/bin/env node
import { info } from '../utils/functions/info.function.js';
import { runCommand } from '../utils/functions/run-command.function.js';
import chokidar from 'chokidar';
import { fork } from 'node:child_process';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';

const command = process.argv[2];

const debounce = (callback: Function, timeout = 150) => {
  let timer: NodeJS.Timeout;

  return (...args: any[]) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      callback.apply(this, args);
    }, timeout);
  };
};

switch (command) {
  case 'start:dev':
    const entryFile = 'dist/main.js';

    const watcherOptions = {
      ignoreInitial: true,
      cwd: process.cwd(),
    };

    const sourceWatcher = chokidar.watch(
      'dist',
      watcherOptions,
    );

    const internalWatcher = chokidar.watch(
      'node_modules/@nucleonjs/core/dist',
      watcherOptions,
    );

    const viewWatcher = chokidar.watch(['src/**/*.html'], watcherOptions);
    const envWatcher = chokidar.watch(['.env'], watcherOptions);

    const processOptions = {
      execArgv: ['--experimental-specifier-resolution=node', '--no-warnings'],
    };

    let child = fork(entryFile, processOptions);

    const restartProcess = debounce(() => {
      info('Restarting the server...');

      child.kill();

      child = fork(entryFile, processOptions);
    });

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

        const tempPath = `${tmpdir()}/nucleon`;

        unlinkSync(tempPath);

        child.kill();

        process.exit();
      }
    });

    break;

  case 'start:prod':
    runCommand('node --experimental-specifier-resolution=node dist/main.js');

    break;
}
