import { inject } from '../../injector/functions/inject.function';
import { ServerOptions } from '../interfaces/server-options.interface';
import { Server } from '../server.class';

export const createServer = async (options: ServerOptions) => {
  const server = await inject(Server).setup(options);

  return server;
};
