import { Service } from '../injector/decorators/service.decorator.js';
import { Response } from './response.service.js';

@Service()
export class JsonResponse extends Response {
  constructor(public readonly data: Record<string, unknown> = {}) {
    super();
  }
}
