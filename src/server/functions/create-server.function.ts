import { ServerOptions } from '../interfaces/server-options.interface';
import { Server } from '../server.class';

export const createServer = <DatabaseClient>(
  options: ServerOptions<DatabaseClient>,
) => {
  return new Server<DatabaseClient>(options);
};
