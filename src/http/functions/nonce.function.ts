import { Request } from '../../http/request.class';
import { inject } from '../../injector/functions/inject.function';

export const nonce = () => {
  return inject(Request).nonce();
};
