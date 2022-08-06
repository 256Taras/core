#!/usr/bin/env node
import 'reflect-metadata';
import { error } from '../utils/functions/error.function.js';
import { Constructor } from '../utils/interfaces/constructor.interface.js';
import { StartDev } from './commands/start-dev.command.js';
import { StartProd } from './commands/start-prod.command.js';
import { Command } from './interfaces/command.interface.js';

const commands: Constructor<Command>[] = [StartDev, StartProd];

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
