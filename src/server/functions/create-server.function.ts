import { Server } from '../server.class';
import { ServerOptions } from '../interfaces/server-options.interface';

export const createServer = (options: ServerOptions) => {
  return new Server(options);
};
