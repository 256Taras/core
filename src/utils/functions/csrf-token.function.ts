import { Response } from '../../http/response.class';
import { inject } from '../../injector/functions/inject.function';

export const csrfToken = async () => {
  const token = await inject(Response).csrfToken();

  return token;
};
