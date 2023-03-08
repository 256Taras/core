import { Service } from '../injector/decorators/service.decorator.js';
import { Response } from './response.service.js';

@Service()
export class DownloadResponse extends Response {
  constructor(public readonly file: string) {
    super();
  }
}
