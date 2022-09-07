#!/usr/bin/env node --experimental-specifier-resolution=node --no-warnings
import { Reflection as Reflect } from '@abraham/reflection';
import { config as configDotenv } from 'dotenv';
import { parseArgs } from 'node:util';
import { error } from '../src/logger/functions/error.function';
import { Constructor } from '../src/utils/interfaces/constructor.interface';
import { DbMigrateCommand } from './commands/db-migrate.command';
import { ServerDevCommand } from './commands/server-dev.command';
import { StartDevCommand } from './commands/start-dev.command';
import { StartProdCommand } from './commands/start-prod.command';
import { Command } from './interfaces/command.interface';
import { Parameter } from './interfaces/parameter.interface';

process.on('uncaughtException', (exception: Error) => {
  error(exception.message);

  process.exit(1);
});

configDotenv({
  path: '.env',
});

const commands: Constructor<Command>[] = [
  DbMigrateCommand,
  ServerDevCommand,
  StartDevCommand,
  StartProdCommand,
];

commands.map((command: Constructor<Command>) => {
  const name = Reflect.getMetadata('signature', command);

  const requiredArguments: Record<string, Parameter> =
    Reflect.getMetadata('parameters', command) ?? {};

  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      cmd: {
        type: 'string',
      },
      ...requiredArguments,
    },
    allowPositionals: true,
  });

  if (name === positionals[0]) {
    const instance: Command = new command();

    instance.handle(values);
  }
});
