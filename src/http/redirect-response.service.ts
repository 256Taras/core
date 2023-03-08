import { Service } from '../injector/decorators/service.decorator.js';
import { Endpoint } from '../router/types/endpoint.type.js';
import { RouteUrl } from '../router/types/route-url.type.js';
import { StatusCode } from './enums/status-code.enum.js';
import { Response } from './response.service.js';

@Service()
export class RedirectResponse extends Response {
  constructor(
    public readonly url: RouteUrl | Endpoint,
    public readonly data: Record<string, unknown> = {},
    public readonly statusCode: StatusCode = StatusCode.Found,
  ) {
    super();
  }
}
