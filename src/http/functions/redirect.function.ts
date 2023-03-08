import { Endpoint } from '../../router/types/endpoint.type.js';
import { RouteUrl } from '../../router/types/route-url.type.js';
import { StatusCode } from '../enums/status-code.enum.js';
import { RedirectResponse } from '../redirect-response.service.js';

export function redirect(
  url: RouteUrl | Endpoint,
  data: Record<string, unknown> = {},
  statusCode: StatusCode = StatusCode.Found,
) {
  return new RedirectResponse(url, data, statusCode);
}
