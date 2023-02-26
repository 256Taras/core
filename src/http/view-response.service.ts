import { Service } from '../injector/decorators/service.decorator.js';
import { Response } from './response.service.js';

@Service()
export class ViewResponse extends Response {
  private $data: Record<string, unknown>;

  private $file: string;

  public get data(): Record<string, unknown> {
    return this.$data;
  }

  public get file(): string {
    return this.$file;
  }

  public setData(data: Record<string, unknown> = {}): void {
    this.$data = data;
  }

  public setFile(file: string): void {
    this.$file = file;
  }
}
