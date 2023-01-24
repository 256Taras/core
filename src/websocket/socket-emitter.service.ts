import { pathToRegexp } from 'path-to-regexp';
import { Service } from '../injector/decorators/service.decorator';
import { inject } from '../injector/functions/inject.function';
import { Logger } from '../logger/logger.service';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Integer } from '../utils/types/integer.type';
import { Authorizer } from './interfaces/authorizer.interface';
import { Channel } from './types/channel.type';
import { SocketServer } from './socket-server.service';

@Service()
export class SocketEmitter {
  private channels: Channel[] = [];

  private servers: SocketServer[] = [];

  constructor(private logger: Logger) {}

  public $setup(servers: Record<string, Integer>): void {
    for (const [name, port] of Object.entries(servers)) {
      const server = inject(SocketServer);

      server.listen(name, port);

      this.servers.push(server);
    }
  }

  public createChannel(
    name: string,
    serverName = 'main',
    authorizationCallback?: (() => boolean),
  ): void {
    const pattern = pathToRegexp(name);
  
    this.registerChannels([
      class implements Authorizer {
        public readonly namePattern = pattern;
  
        public readonly serverName = serverName;
  
        public pass(): boolean {
          return authorizationCallback?.() ?? true;
        }
      },
    ]);
  }

  public emit(event: string, channelName: string, ...data: unknown[]): void {
    this.channels.map((channel) => {
      const pattern = channel.namePattern;
      const serverName = channel.serverName;

      if (pattern?.test(channelName) && channel.pass()) {
        const server = this.servers.find((server) => server.name === serverName);

        if (!server) {
          throw new Error(`Server with name '${serverName}' not found`);
        }

        server.emit(`${channelName}/${event}`, ...data);

        this.logger.log(`Emitted: ${channelName}/${event}`, 'websocket');

        return;
      }
    });
  }

  public registerChannels(channels: Constructor<Authorizer>[]): void {
    channels.map((channel) => {
      const instance = inject(channel as unknown as Constructor);

      this.channels.push(instance);
    });
  }
}
