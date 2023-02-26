import { Service } from '../injector/decorators/service.decorator.js';
import { StatusCode } from './enums/status-code.enum.js';
import { Response } from './response.service.js';

@Service()
export class RedirectBackResponse extends Response {
  private $data: Record<string, unknown>;

  private $status: StatusCode;

  public get data(): Record<string, unknown> {
    return this.$data;
  }

  public get statusCode(): StatusCode {
    return this.$status;
  }

  public setData(data: Record<string, unknown> = {}): void {
    this.$data = data;
  }

  public setStatus(status: StatusCode = StatusCode.Found): void {
    this.$status = status;
  }
}
