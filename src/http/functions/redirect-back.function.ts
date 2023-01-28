import { inject } from '../../injector/functions/inject.function.js';
import { StatusCode } from '../enums/status-code.enum.js';
import { RedirectBackResponse } from '../redirect-back-response.service.js';

export function redirectBack(
  data: Record<string, unknown> = {},
  status: StatusCode = StatusCode.Found,
) {
  const instance = inject(RedirectBackResponse);

  instance.setData(data);
  instance.setStatus(status);

  return instance;
}
