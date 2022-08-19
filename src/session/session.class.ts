import { Service } from '../injector/decorators/service.decorator';
import { Request } from '../http/request.class';

@Service()
export class Session {
  constructor(private request: Request) {}

  public get data(): Record<string, any> {
    return this.request.session;
  }

  public destroy(): void {
    this.request.session.destroy?.();
  }

  public id(): string {
    return this.request.session.id;
  }

  public regenerate(): void {
    this.request.session.regenerate?.();
  }

  public reload(): void {
    this.request.session.reload?.();
  }

  public set(name: string, value: any): void {
    this.request.session[name] = value;
  }
}
