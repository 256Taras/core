import { pathToRegexp } from 'path-to-regexp';
import { inject } from '../../injector/functions/inject.function';
import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Authorizer } from '../interfaces/authorizer.interface';
import { SocketEmitter } from '../socket-emitter.service';

export function createChannel(
  name: string,
  channel: Constructor & Authorizer,
): void {
  const socketEmitter = inject(SocketEmitter);
  const pattern = pathToRegexp(name);

  socketEmitter.registerChannels([
    class extends channel {
      public readonly namePattern: RegExp = pattern;
    },
  ]);
}
