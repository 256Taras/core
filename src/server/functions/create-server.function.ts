import { inject } from '../../injector/functions/inject.function';
import { ServerOptions } from '../interfaces/server-options.interface';
import { Server } from '../server.service';

export async function createServer(options: ServerOptions) {
  return await inject(Server).$setup(options);
}
