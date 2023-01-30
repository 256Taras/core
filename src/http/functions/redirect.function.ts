import { inject } from '../../injector/functions/inject.function.js';
import { RouteUrl } from '../../router/types/route-url.type.js';
import { StatusCode } from '../enums/status-code.enum.js';
import { RedirectResponse } from '../redirect-response.service.js';

export function redirect(
  url: RouteUrl,
  data: Record<string, unknown> = {},
  status: StatusCode = StatusCode.Found,
) {
  const instance = inject(RedirectResponse);

  instance.setData(data);
  instance.setStatus(status);
  instance.setUrl(url);

  return instance;
}
