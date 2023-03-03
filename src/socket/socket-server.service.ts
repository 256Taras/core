import { WebSocketServer } from 'ws';
import { Service } from '../injector/decorators/service.decorator.js';
import { inject } from '../injector/functions/inject.function.js';
import { Logger } from '../logger/logger.service.js';
import { Integer } from '../utils/types/integer.type.js';

@Service()
export class SocketServer {
  private readonly logger = inject(Logger);

  private nameIdentifier: string | null = null;

  private server: WebSocketServer;

  public emit(event: string, ...payload: unknown[]): void {
    this.server.clients.forEach((client) => {
      client.send(JSON.stringify({ event, payload }));
    });
  }

  public get name(): string | null {
    return this.nameIdentifier;
  }

  public listen(name: string, port: Integer): void {
    this.nameIdentifier = name;

    this.server = new WebSocketServer({
      port,
    });

    if (this.name !== '$northleSocket') {
      this.logger.log(`Server ${this.name} listening on ws://${port}`, 'socket');

      this.server.on('connection', (_socket, request) => {
        this.logger.log(
          `[${request.socket.remoteAddress}] Established new connection`,
          'socket',
        );
      });
    }
  }
}
