import { inject } from '../../injector/functions/inject.function';
import { Request } from '../request.class';

export function nonce() {
  return inject(Request).nonce();
}
