import { Response } from '../response.class';
import { inject } from '../../injector/functions/inject.function';

export const scriptNonce = () => {
  return inject(Response).scriptNonce();
};
