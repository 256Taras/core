import { Method } from '../enums/method.enum';
import { Request as Req } from 'express';
import { Service } from '../../injector/decorators/service.decorator';

@Service()
export class Request {
  private instance: Req | null = null;

  public _setInstance(instance: Req): void {
    this.instance = instance;
  }

  public ajax(): boolean {
    return this.instance?.xhr ?? false;
  }

  public get body(): Record<string, any> {
    return this.instance?.body ?? {};
  }

  public get cookies(): Record<string, any> {
    return this.instance?.cookies ?? {};
  }

  public cookie(key: string): any {
    return this.cookies[key] ?? null;
  }

  public host(): string | null {
    return this.instance?.hostname ?? null;
  }

  public input(key: string): any {
    return this.body[key] ?? null;
  }

  public ip(): string | null {
    return this.instance?.ip ?? null;
  }

  public ips(): string[] | null {
    return this.instance?.ips ?? null;
  }

  public method(): Method {
    const methods = {
      'get': Method.Get,
      'post': Method.Post,
      'put': Method.Put,
      'patch': Method.Patch,
      'delete': Method.Delete,
      'head': Method.Head,
      'options': Method.Options,
    };

    return methods[(this.instance?.method ?? 'get').toLowerCase() as keyof object] ?? Method.Get;
  }

  public get params(): Record<string, any> {
    return this.instance?.params ?? {};
  }

  public param(key: string): any {
    return this.params ? this.params[key] ?? null : null;
  }

  public path(): string | null {
    return this.instance?.path ?? null;
  }

  public protocol(): string | null {
    return this.instance?.protocol ?? null;
  }

  public get query(): any {
    return this.instance?.query ?? {};
  }

  public secure(): boolean {
    return this.instance?.secure ?? false;
  }

  public subdomains(): string[] {
    return this.instance?.subdomains ?? [];
  }
}
