import { Session } from '../../session/session.class';
import { inject } from '../../injector/functions/inject.function';

export const csrfToken = () => {
  const token = inject(Session).get<string>('_csrf');

  return token;
};
