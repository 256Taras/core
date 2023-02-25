import { env } from '../../configurator/functions/env.function.js';
import { Command } from '../decorators/command.decorator.js';
import { StartDevCommand } from './start-dev.command.js';
import { StartProdCommand } from './start-prod.command.js';
console.log(process.env)
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
    await new (env<boolean>('DEVELOPMENT')
      ? StartDevCommand
      : StartProdCommand)().handle(flags);
  }
}
