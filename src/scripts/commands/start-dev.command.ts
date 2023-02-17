import concurrently from 'concurrently';
import { existsSync } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname } from 'node:path';
import { logInfo } from '../../logger/functions/log-info.function.js';
import { runCommand } from '../../utils/functions/run-command.function.js';
import { Command } from '../decorators/command.decorator.js';

@Command({
  signature: 'start:dev',
  parameters: {
    open: {
      type: 'boolean',
      short: 'o',
      default: false,
    },
    verbose: {
      type: 'boolean',
      short: 'v',
      default: false,
    },
  },
})
export class StartDevCommand {
  public async handle(flags: Record<string, boolean>): Promise<void> {
    const serverTempPath = `${tmpdir()}/northle/server/server.tmp`;
    const buildLogsTempPath = `${tmpdir()}/northle/build/logs.tmp`;

    console.clear();

    runCommand('tsc');

    if (!existsSync(dirname(buildLogsTempPath))) {
      await mkdir(dirname(buildLogsTempPath), {
        recursive: true,
      });
    }

    const { result } = concurrently(
      [
        `tsc --watch${!flags.verbose ? ` > ${buildLogsTempPath}` : ''}`,
        `app server:dev${flags.open ? ' --open' : ''}`,
      ],
      {
        killOthers: ['failure', 'success'],
        raw: true,
      },
    );

    const exitCallback = async () => {
      if (existsSync(serverTempPath)) {
        await unlink(serverTempPath);
      }

      if (existsSync(buildLogsTempPath)) {
        await unlink(buildLogsTempPath);
      }

      logInfo('Server terminated');

      process.exit(0);
    };

    result.then(exitCallback, exitCallback);
  }
}
