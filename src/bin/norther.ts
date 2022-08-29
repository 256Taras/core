#!/usr/bin/env node --experimental-specifier-resolution=node --no-warnings
import { Reflection as Reflect } from '@abraham/reflection';
import { parseArgs } from 'node:util';
import { error } from '../logger/functions/error.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { DbMigrateCommand } from './commands/db-migrate.command';
import { RunServerCommand } from './commands/run-server.command';
import { StartDevCommand } from './commands/start-dev.command';
import { StartProdCommand } from './commands/start-prod.command';
import { Command } from './interfaces/command.interface';
import { Parameter } from './interfaces/parameter.interface';

process.on('uncaughtException', (exception: Error) => {
  error(exception.message);

  process.exit(1);
});

const commands: Constructor<Command>[] = [
  DbMigrateCommand,
  RunServerCommand,
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
