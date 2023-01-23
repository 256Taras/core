import { Reflection as Reflect } from '@abraham/reflection';
import { parseArgs } from 'node:util';
import { Configurator } from '../configurator/configurator.service';
import { inject } from '../injector/functions/inject.function';
import { logError } from '../logger/functions/log-error.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { BuildCommand } from './commands/build.command';
import { DbMigrateCommand } from './commands/db-migrate.command';
import { DbSeedCommand } from './commands/db-seed.command';
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

await inject(Configurator).loadEnvironment();

const commands: Constructor<Command>[] = [
  BuildCommand,
  DbMigrateCommand,
  DbSeedCommand,
  KeyGenerateCommand,
  PreparePublishCommand,
  ServerDevCommand,
  StartDevCommand,
  StartProdCommand,
];

let isCommandValid = false;

await Promise.all(
  commands.map(async (command: Constructor<Command>) => {
    const signatures = [
      Reflect.getMetadata('signature', command),
      ...(Reflect.getMetadata<string[]>('signatures', command) ?? []),
    ];

    if (signatures.includes(process.argv[2])) {
      const requiredArguments: Record<string, Parameter> =
        Reflect.getMetadata('parameters', command) ?? {};

      const { values, positionals } = parseArgs({
        args: process.argv.slice(3),
        options: {
          ...requiredArguments,
        },
        allowPositionals: true,
        strict: false,
      });

      const instance: Command = new command();

      const requiredPositionals = Object.values(requiredArguments).filter(
        (parameter) => parameter.type === 'string',
      );

      const resolvedPositionals = new Array(requiredPositionals.length);

      positionals.map((positional, index) => {
        resolvedPositionals[index] = positional;
      });

      resolvedPositionals.fill(undefined, positionals.length);

      try {
        await instance.handle(...resolvedPositionals, values);
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
