import { Service } from '../injector/decorators/service.decorator.js';
import { Response } from './response.service.js';

@Service()
export class DownloadResponse extends Response {
  private $file: string;

  public get file(): string {
    return this.$file;
  }

  public setFile(file: string): void {
    this.$file = file;
  }
}
