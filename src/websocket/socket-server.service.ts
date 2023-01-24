import { WebSocketServer } from 'ws';
import { Service } from '../injector/decorators/service.decorator';
import { Logger } from '../logger/logger.service';
import { Integer } from '../utils/types/integer.type';

@Service()
export class SocketServer {
  private nameIdentifier: string | null = null;

  private server: WebSocketServer;

  constructor(private logger: Logger) {}

  public emit(event: string, ...data: unknown[]): void {
    this.server.emit(event, ...data);
  }

  public get name(): string | null {
    return this.nameIdentifier;
  }

  public listen(name: string, port: Integer): void {
    this.nameIdentifier = name;

    this.server = new WebSocketServer({
      port,
    });

    this.logger.log(
      `Server ${this.name} listening on ws://${port}`,
      'websocket',
    );

    this.server.on('connection', (_socket, request) => {
      this.logger.log(
        `[${request.socket.remoteAddress}] Established new connection`,
        'websocket',
      );
    });
  }
}
