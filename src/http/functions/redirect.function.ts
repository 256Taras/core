import { RedirectResponse } from '../redirect-response.class';
import { inject } from '../../injector/functions/inject.function';
import { StatusCode } from '../enums/status-code.enum';

export const redirect = (url: string, data: Record<string, any> = {}, status: StatusCode = StatusCode.Found) => {
  const instance = inject(RedirectResponse);

  instance.setData(data);
  instance.setStatus(status);
  instance.setUrl(url);

  return instance;
};
