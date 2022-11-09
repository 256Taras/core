import { inject } from '../../injector/functions/inject.function';
import { Request } from '../../http/request.class';

export const nonce = () => {
  return inject(Request).nonce();
}
