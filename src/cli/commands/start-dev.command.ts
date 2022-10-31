import concurrently from 'concurrently';
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
  public async handle(open: boolean): Promise<void> {
    const { result } = concurrently(
      ['tsc --watch', `app server:dev${open ? ' --open' : ''}`],
      {
        killOthers: ['failure', 'success'],
        raw: true,
      },
    );

    result.then(
      () => {
        logInfo('Server terminated');

        process.exit(0);
      },
      () => {
        logInfo('Server terminated');

        process.exit(0);
      },
    );
  }
}
