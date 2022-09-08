import { Server as SocketServer, Socket } from 'socket.io';
import { Server } from '../server/server.class';
import { Service } from '../injector/decorators/service.decorator';
import { Logger } from '../logger/logger.class';
import { Authorizer } from './interfaces/authorizer.nterface';
import { inject } from '../injector/functions/inject.function';
import { Constructor } from '../utils/interfaces/constructor.interface';

@Service()
export class SocketEmitter {
  private channels: (Authorizer & { namePattern: RegExp })[] = [];

  private socketServer: SocketServer;

  constructor(private logger: Logger, private server: Server) {
    this.socketServer = new SocketServer(this.server.$nativeHttpServer());

    this.socketServer.on('connection', (socket: Socket) => {
      this.logger.log(`Established connection: ${socket.id}`, 'socket');
    });
  }

  public emit(event: string, channelName: string, ...data: unknown[]): void {
    this.channels.forEach((channel) => {
      if (channel.namePattern.test(channelName) && channel.passesUser()) {
        this.socketServer.emit(`${channelName}/${event}`, ...data);

        this.logger.log(`Emitted: ${channelName}/${event}`, 'socket');

        return;
      }
    })
  }

  public registerChannels(channels: Authorizer[]): void {
    channels.forEach((channel) => {
      const instance = inject(channel as unknown as Constructor);

      this.channels.push(instance);
    })
  }
}
