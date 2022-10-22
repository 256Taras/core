import { Request } from '../http/request.class';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class Session {
  constructor(private request: Request) {}

  public get data(): Record<string, any> {
    return this.request.session;
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
