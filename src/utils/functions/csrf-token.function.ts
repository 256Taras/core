import { inject } from '../../injector/functions/inject.function.js';
import { Session } from '../../session/session.service.js';

export function csrfToken() {
  return inject(Session).get<string>('_csrfToken');
}
