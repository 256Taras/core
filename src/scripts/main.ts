import { Reflection as Reflect } from '@abraham/reflection';
import { parseArgs } from 'node:util';
import { Configurator } from '../configurator/configurator.service.js';
import { inject } from '../injector/functions/inject.function.js';
import { logError } from '../logger/functions/log-error.function.js';
import { Constructor } from '../utils/interfaces/constructor.interface.js';
import { BuildCommand } from './commands/build.command.js';
import { DbMigrateCommand } from './commands/db-migrate.command.js';
import { DbSeedCommand } from './commands/db-seed.command.js';
import { KeysGenerateCommand } from './commands/keys-generate.command.js';
import { PreparePublishCommand } from './commands/prepare-publish.command.js';
import { ServerDevCommand } from './commands/server-dev.command.js';
import { StartCommand } from './commands/start.command.js';
import { StartDevCommand } from './commands/start-dev.command.js';
import { StartProdCommand } from './commands/start-prod.command.js';
import { Command } from './interfaces/command.interface.js';
import { Parameter } from './interfaces/parameter.interface.js';

process.on('uncaughtException', (error: Error) => {
  logError(error.message);

  process.exit(1);
});

await inject(Configurator).loadEnvironment();

const commands: Constructor<Command>[] = [
  BuildCommand,
  DbMigrateCommand,
  DbSeedCommand,
  KeysGenerateCommand,
  PreparePublishCommand,
  ServerDevCommand,
  StartCommand,
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
