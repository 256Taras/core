import { pathToRegexp } from 'path-to-regexp';
import { Service } from '../injector/decorators/service.decorator.js';
import { inject } from '../injector/functions/inject.function.js';
import { Logger } from '../logger/logger.service.js';
import { Constructor } from '../utils/interfaces/constructor.interface.js';
import { Integer } from '../utils/types/integer.type.js';
import { Authorizer } from './interfaces/authorizer.interface.js';
import { SocketServer } from './socket-server.service.js';
import { Channel } from './types/channel.type.js';

@Service()
export class SocketEmitter {
  private channels: Channel[] = [];

  private readonly logger = inject(Logger);

  private servers: SocketServer[] = [];

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
    authorizationCallback?: () => boolean,
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

  public emit(event: string, channelName: string, ...payload: unknown[]): void {
    this.channels.map((channel) => {
      const pattern = channel.namePattern;
      const serverName = channel.serverName;

      if (pattern?.test(channelName) && channel.pass()) {
        const server = this.servers.find((server) => server.name === serverName);

        if (!server) {
          throw new Error(`Server with name '${serverName}' not found`);
        }

        server.emit(`${channelName}/${event}`, ...payload);

        if (serverName !== '$northleSocket') {
          this.logger.log(`Emitted event: ${channelName}/${event}`, 'socket');
        }

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
