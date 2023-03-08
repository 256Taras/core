import { StatusCode } from '../enums/status-code.enum.js';
import { RedirectBackResponse } from '../redirect-back-response.service.js';

export function redirectBack(
  data: Record<string, unknown> = {},
  statusCode: StatusCode = StatusCode.Found,
) {
  return new RedirectBackResponse(data, statusCode);
}
