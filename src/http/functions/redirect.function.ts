import { inject } from '../../injector/functions/inject.function';
import { StatusCode } from '../enums/status-code.enum';
import { RedirectResponse } from '../redirect-response.service';

export function redirect(
  url: string,
  data: Record<string, unknown> = {},
  status: StatusCode = StatusCode.Found,
) {
  const instance = inject(RedirectResponse);

  instance.setData(data);
  instance.setStatus(status);
  instance.setUrl(url);

  return instance;
}
