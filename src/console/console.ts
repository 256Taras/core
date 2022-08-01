#!/usr/bin/env node

import { execSync, fork } from 'node:child_process';
import chokidar from 'chokidar';

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

    const watcher = chokidar.watch('dist', {
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
    });

    process.stdin.resume();

    process.stdin.setEncoding('utf8');

    let buffer = '';

    process.stdin.on('data', (data) => {
      const key = data.toString().charCodeAt(0);

      buffer += data.toString();

      if (key === 10 || key === 13 || buffer === '.exit') {
        process.exit(0);
      }
    });

    break;

  case 'start:prod':
    runCommand('node --experimental-specifier-resolution=node dist/main.js');

    break;
}
