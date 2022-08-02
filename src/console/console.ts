#!/usr/bin/env node

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

    const watcher = chokidar.watch(['dist', 'node_modules/@nucleonjs/core/dist'], {
      ignoreInitial: true,
      cwd: process.cwd(),
    });

    const processOptions = {
      execArgv: [
        '--experimental-specifier-resolution=node',
        '--no-warnings',
      ],
    };

    let child = fork(file, processOptions);

    watcher.on('all', () => {
      child.kill();

      child = fork(file, processOptions);

      runCommand('copyfiles -u 1 src/**/*.html dist/');
    });

    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }

    let buffer = '';
    let ctrlC = false;

    process.stdin.on('data', (data) => {
      const key = data.toString()
        .trim()
        .toLowerCase()
        .charCodeAt(0);

      buffer += data.toString();

      if (key === 99) {
        if (ctrlC) {
          process.exit();
        }

        ctrlC = true;
      }

      if ([13, 27, 101, 108, 113, NaN].includes(key) || buffer === '.exit') {
        child.kill();

        process.kill(process.pid, 'SIGINT');
        process.exit();
      }
    });

    break;

  case 'start:prod':
    runCommand('node --experimental-specifier-resolution=node dist/main.js');

    break;
}
