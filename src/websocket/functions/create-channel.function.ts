import { inject } from '../../injector/functions/inject.function';
import { SocketEmitter } from '../socket-emitter.service';

export function createChannel(
  name: string,
  serverName = 'main',
  authorizationCallback?: () => boolean,
): void {
  const socketEmitter = inject(SocketEmitter);

  socketEmitter.createChannel(name, serverName, authorizationCallback);
}
