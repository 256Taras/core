import { Integer } from '../types/integer.type';
import { createServer } from 'node:net';

export const isPortAvailable = (port: Integer) => {
  const server = createServer();

  let result = true;

  server.once('error', (error) => {
    if (error.message === 'EADDRINUSE') {
      result = false;
    }
  });

  server.once('listening', () => {
    server.close();
  });

  server.listen(port);

  return result;
};
