import { inject } from '../../injector/functions/inject.function';
import { Session } from '../session.class';

export const session = <T = string>(key: string) => {
  const session = inject(Session);

  return session.get<T>(key);
};
