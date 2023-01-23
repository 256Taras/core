import { inject } from '../../injector/functions/inject.function';
import { Request } from '../request.service';

export function nonce() {
  return inject(Request).nonce();
}
