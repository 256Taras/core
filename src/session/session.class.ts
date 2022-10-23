import { Request } from '../http/request.class';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class Session {
  constructor(private request: Request) {}

  public $setRequest(request: Request): void {
    this.request = request;
  }

  public get data(): Record<string, any> {
    return this.request.session;
  }

  public decrement(key: string, by = 1): number {
    if (typeof this.request.session[key] !== 'number') {
      throw new Error(`Session value '${key}' is not a number`);
    }

    this.request.session[key] -= by;

    return this.request.session[key];
  }

  public delete(key: string): void {
    delete this.request.session[key];
  }

  public destroy(): void {
    this.request.session.destroy?.();
  }

  public flash<T>(key: string, value?: unknown): T | void {
    const flashKey = `_flash:${key}`;

    if (value === undefined) {
      const data = this.request.session[flashKey] ?? null;

      this.delete(flashKey);

      return data;
    }

    this.request.session[flashKey] = value;
  }

  public get<T>(key: string): T | null {
    return this.request.session[key] ?? null;
  }

  public id(): string {
    return this.request.session.id;
  }

  public increment(key: string, by = 1): number {
    if (typeof this.request.session[key] !== 'number') {
      throw new Error(`Session value '${key}' is not a number`);
    }

    this.request.session[key] += by;

    return this.request.session[key];
  }

  public regenerate(): void {
    this.request.session.regenerate?.();
  }

  public reload(): void {
    this.request.session.reload?.();
  }

  public set(name: string, value: unknown): void {
    this.request.session[name] = value;
  }
}
