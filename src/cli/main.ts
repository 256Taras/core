import { Reflection as Reflect } from '@abraham/reflection';
import { config as configDotenv } from 'dotenv';
import { parseArgs } from 'node:util';
import { logError } from '../logger/functions/log-error.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { BuildCommand } from './commands/build.command';
import { DbMigrateCommand } from './commands/db-migrate.command';
import { KeyGenerateCommand } from './commands/key-generate.command';
import { PreparePublishCommand } from './commands/prepare-publish.command';
import { ServerDevCommand } from './commands/server-dev.command';
import { StartDevCommand } from './commands/start-dev.command';
import { StartProdCommand } from './commands/start-prod.command';
import { Command } from './interfaces/command.interface';
import { Parameter } from './interfaces/parameter.interface';

process.on('uncaughtException', (error: Error) => {
  logError(error.message);

  process.exit(1);
});

configDotenv({
  path: '.env',
});

const commands: Constructor<Command>[] = [
  BuildCommand,
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

    const argumentValues = parseArgs({
      args: process.argv.slice(3),
      options: {
        ...requiredArguments,
      },
      strict: false,
    }).values;

    if (name === process.argv[2]) {
      const instance: Command = new command();

      try {
        await instance.handle(...Object.values(argumentValues));
      } catch (error) {
        logError((error as Error).message);

        process.exit(1);
      }

      isCommandValid = true;

      return;
    }
  }),
);

if (!isCommandValid) {
  logError(`Unknown command '${process.argv[2]}'`);
}
