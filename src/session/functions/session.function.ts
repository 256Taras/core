import { inject } from '../../injector/functions/inject.function.js';
import { Session } from '../session.service.js';

export function session<T = string>(key: string) {
  const session = inject(Session);

  return session.get<T>(key);
}
