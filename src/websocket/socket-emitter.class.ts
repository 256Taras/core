import { Reflection as Reflect } from '@abraham/reflection';
import { RawServerDefault } from 'fastify';
import { Socket, Server as SocketServer } from 'socket.io';
import { Service } from '../injector/decorators/service.decorator';
import { inject } from '../injector/functions/inject.function';
import { Logger } from '../logger/logger.class';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Authorizer } from './interfaces/authorizer.interface';
import { Channel } from './types/channel.type';

@Service()
export class SocketEmitter {
  private channels: Channel[] = [];

  private socketServer: SocketServer;

  constructor(private logger: Logger) {}

  public $setup(server: RawServerDefault): void {
    this.socketServer = new SocketServer(server);

    this.socketServer.on('connection', (socket: Socket) => {
      this.logger.log(`Established connection [ID ${socket.id}]`, 'socket');
    });

    this.socketServer.on('close', (socket: Socket) => {
      this.logger.log(`Closed connection [ID ${socket.id}]`, 'socket');
    });
  }

  public emit(event: string, channelName: string, ...data: unknown[]): void {
    this.channels.map((channel) => {
      const pattern = channel.namePattern;

      if (pattern?.test(channelName) && channel.pass()) {
        this.socketServer.emit(`${channelName}/${event}`, ...data);

        this.logger.log(`Emitted: ${channelName}/${event}`, 'socket');

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
