import { ServerOptions } from '../interfaces/server-options.interface';
import { Server } from '../server.class';

export const createServer = (options: ServerOptions) => {
  return new Server(options);
};
