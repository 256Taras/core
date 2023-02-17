import { env } from '../../utils/functions/env.function.js';
import { Command } from '../decorators/command.decorator.js';
import { StartDevCommand } from './start-dev.command.js';
import { StartProdCommand } from './start-prod.command.js';

@Command({
  signature: 'start',
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
export class StartCommand {
  public async handle(flags: Record<string, boolean>): Promise<void> {
    await new (env<boolean>('DEVELOPMENT') ? StartDevCommand : StartProdCommand)().handle(flags);
  }
}
