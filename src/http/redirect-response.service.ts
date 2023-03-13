import { Service } from '../injector/decorators/service.decorator.js';
import { RouteUrl } from '../router/types/route-url.type.js';
import { Url } from '../router/types/url.type.js';
import { StatusCode } from './enums/status-code.enum.js';
import { Response } from './response.service.js';

@Service()
export class RedirectResponse extends Response {
  constructor(
    public readonly url: RouteUrl | Url,
    public readonly data: Record<string, unknown> = {},
    public readonly statusCode: StatusCode = StatusCode.Found,
  ) {
    super();
  }
}
