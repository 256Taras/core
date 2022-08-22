#!/usr/bin/env node --experimental-specifier-resolution=node --no-warnings
import 'reflect-metadata';
import { error } from '../logger/functions/error.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { DbMigrate } from './commands/db-migrate.command';
import { StartDev } from './commands/start-dev.command';
import { StartProd } from './commands/start-prod.command';
import { Command } from './interfaces/command.interface';

process.on('uncaughtException', (exception: Error) => {
  error(exception.message);

  process.exit(1);
});

const commands: Constructor<Command>[] = [DbMigrate, StartDev, StartProd];

commands.map((command: Constructor<Command>) => {
  const name = Reflect.getMetadata('signature', command);

  if (name === process.argv[2]) {
    const requiredArguments = Reflect.getMetadata('parameters', command) ?? [];

    const parameters: string[] = [];

    requiredArguments.map((argument: string, index: number) => {
      const resolved = process.argv[index + 3];

      parameters.push(resolved);

      if (!resolved) {
        error(`Parameter '${argument}' is required`);

        process.exit(1);
      }
    });

    const instance: Command = new command();

    instance.handle(...parameters);
  }
});
