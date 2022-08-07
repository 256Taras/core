import { Injector } from '../../injector/injector.class';
import { ServerOptions } from '../interfaces/server-options.interface';
import { Server } from '../server.class';

export const createServer = (options: ServerOptions) => {
  const server = Injector.resolve(Server);

  return server.setup(options);
};
