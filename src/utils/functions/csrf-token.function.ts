import { inject } from '../../injector/functions/inject.function';
import { Session } from '../../session/session.class';

export const csrfToken = () => {
  return inject(Session).get<string>('_csrfToken');
};
