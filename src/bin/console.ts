#!/usr/bin/env node
import { info } from '../utils/functions/info.function.js';
import chokidar from 'chokidar';
import { execSync, fork } from 'node:child_process';

const runCommand = (command: string) => {
  try {
    execSync(command, {
      stdio: 'pipe',
    });

    return true;
  } catch (error) {
    return false;
  }
};

const command = process.argv[2];

switch (command) {
  case 'start:dev':
    const file = 'dist/main.js';

    const sourceWatcher = chokidar.watch(['dist', 'node_modules/@nucleonjs/core/dist'], {
      ignoreInitial: true,
      cwd: process.cwd(),
    });

    const viewWatcher = chokidar.watch(['src/**/*.html'], {
      ignoreInitial: true,
      cwd: process.cwd(),
    });

    const processOptions = {
      execArgv: ['--experimental-specifier-resolution=node', '--no-warnings'],
    };

    let child = fork(file, processOptions);

    sourceWatcher.on('all', () => {
      child.kill();

      child = fork(file, processOptions);

      runCommand('copyfiles -u 1 src/**/*.html dist/');
    });

    viewWatcher.on('all', () => {
      runCommand('copyfiles -u 1 src/**/*.html dist/');
    });

    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }

    process.stdin.resume();

    process.stdin.on('data', (data) => {
      const key = data.toString().trim().toLowerCase().charCodeAt(0);

      if ([13, 27, 101, 108, 113, NaN].includes(key)) {
        info(`Server stopped [press ${process.platform === 'darwin' ? 'command' : 'ctrl'}+c to exit]`);

        child.kill();

        process.kill(process.pid, 'SIGINT');
      }
    });

    break;

  case 'start:prod':
    runCommand('node --experimental-specifier-resolution=node dist/main.js');

    break;
}
