import { RouteUrl } from '../../router/types/route-url.type.js';
import { Url } from '../../router/types/url.type.js';
import { StatusCode } from '../enums/status-code.enum.js';
import { RedirectResponse } from '../redirect-response.service.js';

export function redirect(
  url: RouteUrl | Url,
  data: Record<string, unknown> = {},
  statusCode: StatusCode = StatusCode.Found,
) {
  return new RedirectResponse(url, data, statusCode);
}
