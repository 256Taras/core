import concurrently from 'concurrently';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { logInfo } from '../../logger/functions/log-info.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'start:dev',
  parameters: {
    open: {
      type: 'boolean',
      short: 'o',
      default: false,
    },
  },
})
export class StartDevCommand {
  public async handle(flags: Record<string, boolean>): Promise<void> {
    const serverTempPath = `${tmpdir()}/northle/server/server.txt`;

    console.clear();

    const { result } = concurrently(
      ['tsc --watch', `app server:dev${flags.open ? ' --open' : ''}`],
      {
        killOthers: ['failure', 'success'],
        raw: true,
      },
    );

    const exitCallback = async () => {
      if (existsSync(serverTempPath)) {
        await unlink(serverTempPath);
      }

      logInfo('Server terminated');

      process.exit(0);
    };

    result.then(exitCallback, exitCallback);
  }
}
