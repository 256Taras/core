import { inject } from '../../injector/functions/inject.function.js';
import { Request } from '../request.service.js';

export function nonce() {
  return inject(Request).nonce();
}
