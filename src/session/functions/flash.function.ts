import { inject } from '../../injector/functions/inject.function';
import { Session } from '../session.class';

export const flash = <T>(key: string) => {
  const sessionInstance = inject(Session);

  return sessionInstance.flash<T>(key);
};
