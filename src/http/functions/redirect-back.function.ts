import { inject } from '../../injector/functions/inject.function';
import { StatusCode } from '../enums/status-code.enum';
import { RedirectBackResponse } from '../redirect-back-response.class';

export const redirectBack = (
  data: Record<string, any> = {},
  status: StatusCode = StatusCode.Found,
) => {
  const instance = inject(RedirectBackResponse);

  instance.setData(data);
  instance.setStatus(status);

  return instance;
};
