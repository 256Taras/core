import { inject } from '../../injector/functions/inject.function';
import { Session } from '../../session/session.class';

export function csrfToken() {
  return inject(Session).get<string>('_csrfToken');
}
