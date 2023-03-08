import { Service } from '../injector/decorators/service.decorator.js';
import { Endpoint } from '../router/types/endpoint.type.js';
import { RouteUrl } from '../router/types/route-url.type.js';
import { StatusCode } from './enums/status-code.enum.js';
import { Response } from './response.service.js';

@Service()
export class RedirectResponse extends Response {
  private $data: Record<string, unknown>;

  private $status: StatusCode;

  private $url: RouteUrl | Endpoint;

  public get data(): Record<string, unknown> {
    return this.$data;
  }

  public get statusCode(): StatusCode {
    return this.$status;
  }

  public get url(): RouteUrl | Endpoint {
    return this.$url;
  }

  public setData(data: Record<string, unknown> = {}): void {
    this.$data = data;
  }

  public setStatus(status: StatusCode = StatusCode.Found): void {
    this.$status = status;
  }

  public setUrl(url: RouteUrl | Endpoint): void {
    this.$url = url;
  }
}
