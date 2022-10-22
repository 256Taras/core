import { Session } from '../../session/session.class';
import { inject } from '../../injector/functions/inject.function';

export const csrfToken = async () => {
  const token = await inject(Session).get('_csrf');

  return token;
};
