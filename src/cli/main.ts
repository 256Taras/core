import { Reflection as Reflect } from '@abraham/reflection';
import { config as configDotenv } from 'dotenv';
import { parseArgs } from 'node:util';
import { error } from '../logger/functions/error.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { DbMigrateCommand } from './commands/db-migrate.command';
import { KeyGenerateCommand } from './commands/key-generate.command';
import { PreparePublishCommand } from './commands/prepare-publish.command';
import { ServerDevCommand } from './commands/server-dev.command';
import { StartDevCommand } from './commands/start-dev.command';
import { StartProdCommand } from './commands/start-prod.command';
import { Command } from './interfaces/command.interface';
import { Parameter } from './interfaces/parameter.interface';

process.on('uncaughtException', (err: Error) => {
  error(err.message);

  process.exit(1);
});

configDotenv({
  path: '.env',
});

const commands: Constructor<Command>[] = [
  DbMigrateCommand,
  KeyGenerateCommand,
  PreparePublishCommand,
  ServerDevCommand,
  StartDevCommand,
  StartProdCommand,
];

let isCommandValid = false;

await Promise.all(
  commands.map(async (command: Constructor<Command>) => {
    const name = Reflect.getMetadata('signature', command);

    const requiredArguments: Record<string, Parameter> =
      Reflect.getMetadata('parameters', command) ?? {};

    const { values } = parseArgs({
      args: process.argv.slice(3),
      options: {
        ...requiredArguments,
      },
      strict: false,
    });

    if (name === process.argv[2]) {
      const instance: Command = new command();

      try {
        await instance.handle(...Object.values(values));
      } catch (err) {
        error((err as Error).message);

        process.exit(1);
      }

      isCommandValid = true;

      return;
    }
  }),
);

if (!isCommandValid) {
  error(`Unknown command '${process.argv[2]}'`);
}
