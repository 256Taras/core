import { inject } from '../../injector/functions/inject.function';
import { Request } from '../request.class';

export const nonce = () => {
  return inject(Request).nonce();
};
