import { RawServerDefault } from 'fastify';
import { Socket, Server as SocketServer } from 'socket.io';
import { Service } from '../injector/decorators/service.decorator';
import { inject } from '../injector/functions/inject.function';
import { Logger } from '../logger/logger.class';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Authorizer } from './interfaces/authorizer.nterface';
import { Channel } from './types/channel.type';

@Service()
export class SocketEmitter {
  private channels: Channel[] = [];

  private socketServer: SocketServer;

  constructor(private logger: Logger) {}

  public emit(event: string, channelName: string, ...data: unknown[]): void {
    this.channels.forEach((channel) => {
      if (channel.namePattern.test(channelName) && channel.passesUser()) {
        this.socketServer.emit(`${channelName}/${event}`, ...data);

        this.logger.log(`Emitted: ${channelName}/${event}`, 'socket');

        return;
      }
    });
  }

  public registerChannels(channels: (Constructor & Authorizer)[]): void {
    channels.forEach((channel) => {
      const instance = inject(channel as unknown as Constructor);

      this.channels.push(instance);
    });
  }

  public setup(server: RawServerDefault): void {
    this.socketServer = new SocketServer(server);

    this.socketServer.on('connection', (socket: Socket) => {
      this.logger.log(`Established connection: ${socket.id}`, 'socket');
    });
  }
}
