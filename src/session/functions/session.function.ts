import { inject } from '../../injector/functions/inject.function';
import { Session } from '../session.class';

export const session = (key: string) => {
  const sessionInstance = inject(Session);

  return sessionInstance.get(key);
};
