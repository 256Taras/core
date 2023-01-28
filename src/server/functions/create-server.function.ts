import { inject } from '../../injector/functions/inject.function.js';
import { ServerOptions } from '../interfaces/server-options.interface.js';
import { Server } from '../server.service.js';

export async function createServer(options: ServerOptions) {
  return await inject(Server).$setup(options);
}
