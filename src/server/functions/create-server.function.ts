import { Server } from '../server.class';
import { ServerOptions } from '../interfaces/server-options.interface';

export const createServer = <DatabaseClient>(options: ServerOptions) => {
  return new Server<DatabaseClient>(options);
};
