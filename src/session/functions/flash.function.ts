import { inject } from '../../injector/functions/inject.function';
import { Session } from '../session.class';

export const flash = <T = string>(key: string) => {
  const session = inject(Session);

  return session.flash<T>(key);
};
