import { WebSocketServer } from 'ws';
import { Configurator } from '../configurator/configurator.class';
import { Service } from '../injector/decorators/service.decorator';
import { inject } from '../injector/functions/inject.function';
import { Logger } from '../logger/logger.class';
import { env } from '../utils/functions/env.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Integer } from '../utils/types/integer.type';
import { Authorizer } from './interfaces/authorizer.interface';
import { Channel } from './types/channel.type';

@Service()
export class SocketEmitter {
  private channels: Channel[] = [];

  private readonly defaultPort: Integer = 8080;

  private socketServer: WebSocketServer;

  constructor(private configurator: Configurator, private logger: Logger) {}

  public $setup(): void {
    this.socketServer = new WebSocketServer({
      port:
        this.configurator.entries?.websocket?.port ??
        env<Integer>('WEBSOCKET_PORT') ??
        this.defaultPort,
    });

    this.socketServer.on('connection', (_socket, request) => {
      this.logger.log(`[${request.socket.remoteAddress}] Established new connection`, 'websocket');
    });
  }

  public emit(event: string, channelName: string, ...data: unknown[]): void {
    this.channels.map((channel) => {
      const pattern = channel.namePattern;

      if (pattern?.test(channelName) && channel.pass()) {
        this.socketServer.emit(`${channelName}/${event}`, ...data);

        this.logger.log(`Emitted: ${channelName}/${event}`, 'websocket');

        return;
      }
    });
  }

  public registerChannels(channels: (Constructor & Authorizer)[]): void {
    channels.map((channel) => {
      const instance = inject(channel as unknown as Constructor);

      this.channels.push(instance);
    });
  }
}
