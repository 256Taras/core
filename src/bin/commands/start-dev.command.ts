import concurrently from 'concurrently';
import { Command } from '../decorators/command.decorator';

@Command({
  signature: 'start:dev',
})
export class StartDevCommand {
  public handle(): void {
    const { result } = concurrently([
      'tsc --watch',
      'norther run:server',
    ], {
      killOthers: ['failure', 'success'],
      raw: true,
    });

    result.then(() => process.exit(0), () => process.exit(0));
  }
}
