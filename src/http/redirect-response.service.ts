import { Service } from '../injector/decorators/service.decorator.js';
import { RouteUrl } from '../router/types/route-url.type.js';
import { StatusCode } from './enums/status-code.enum.js';
import { Response } from './response.service.js';

@Service()
export class RedirectResponse extends Response {
  private $data: Record<string, unknown>;

  private $status: StatusCode;

  private $url: RouteUrl;

  public get data(): Record<string, unknown> {
    return this.$data;
  }

  public get statusCode(): StatusCode {
    return this.$status;
  }

  public get url(): RouteUrl {
    return this.$url;
  }

  public setData(data: Record<string, unknown> = {}): void {
    this.$data = data;
  }

  public setStatus(status: StatusCode = StatusCode.Found): void {
    this.$status = status;
  }

  public setUrl(url: RouteUrl): void {
    this.$url = url;
  }
}
