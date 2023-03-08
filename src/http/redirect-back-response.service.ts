import { Service } from '../injector/decorators/service.decorator.js';
import { StatusCode } from './enums/status-code.enum.js';
import { Response } from './response.service.js';

@Service()
export class RedirectBackResponse extends Response {
  constructor(
    public readonly data: Record<string, unknown> = {},
    public readonly statusCode: StatusCode = StatusCode.Found,
  ) {
    super();
  }
}
