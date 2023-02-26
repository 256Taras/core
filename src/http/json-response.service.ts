import { Service } from '../injector/decorators/service.decorator.js';
import { Response } from './response.service.js';

@Service()
export class JsonResponse extends Response {
  private $data: Record<string, unknown>;

  public get data(): Record<string, unknown> {
    return this.$data;
  }

  public setData(data: Record<string, unknown> = {}): void {
    this.$data = data;
  }
}
