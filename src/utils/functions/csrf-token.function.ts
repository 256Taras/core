import { inject } from '../../injector/functions/inject.function';
import { Session } from '../../session/session.service';

export function csrfToken() {
  return inject(Session).get<string>('_csrfToken');
}
