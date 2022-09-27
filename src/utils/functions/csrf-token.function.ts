import { inject } from '../../injector/functions/inject.function';
import { Response } from '../../http/response.class';

export const csrfToken = async () => {
  const token = await inject(Response).csrfToken();

  return token;
}
