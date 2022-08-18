import { Service } from '../injector/decorators/service.decorator';
import { Request } from '../http/request.class';

@Service()
export class Session {
  constructor(private request: Request) {}

  public get data(): Record<string, any> {
    return this.request?.session;
  }
}
