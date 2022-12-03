import { Response } from '../response.class';
import { inject } from '../../injector/functions/inject.function';

export const styleNonce = () => {
  return inject(Response).styleNonce();
};
