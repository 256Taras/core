import { inject } from '../../injector/functions/inject.function';
import { Session } from '../../session/session.class';

export const csrfToken = () => {
  const token = inject(Session).get<string>('_csrf');

  return token;
};
