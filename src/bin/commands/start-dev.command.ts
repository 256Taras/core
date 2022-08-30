import concurrently from 'concurrently';
import { info } from '../../logger/functions/info.function';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'start:dev',
})
export class StartDevCommand {
  public handle(): void {
    const { result } = concurrently(['tsc --watch', 'norther run:server'], {
      killOthers: ['failure', 'success'],
      raw: true,
    });

    result.then(
      () => {
        info('Server terminated');

        process.exit(0);
      },
      () => {
        info('Server terminated');

        process.exit(0);
      },
    );
  }
}
