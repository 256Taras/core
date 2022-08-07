import { Method } from '../enums/method.enum';
import { Request as Req } from 'express';
import { Service } from '../../injector/decorators/service.decorator';

@Service()
export class Request {
  private instance: Req | null = null;

  public __setInstance(instance: Req): void {
    this.instance = instance;
  }

  public accepts(types: string[]): string | never[] | false {
    return this.instance?.accepts(...types) ?? [];
  }

  public acceptsCharsets(charsets: string[]): string | never[] | false {
    return this.instance?.acceptsCharsets(...charsets) ?? [];
  }

  public acceptsEncodings(encodings: string[]): string | never[] | false {
    return this.instance?.acceptsEncodings(...encodings) ?? [];
  }

  public acceptsLanguages(languages: string[]): string | never[] | false {
    return this.instance?.acceptsLanguages(...languages) ?? [];
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

  public get headers(): Record<string, any> {
    return this.instance?.headers ?? {};
  }

  public header(header: string): string | string[] | null {
    return this.instance?.header(header) ?? null;
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

  public isType(type: string): string | false {
    return this.instance?.is(type) ?? false;
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

  public param(param: string): any {
    return this.params ? this.params[param] ?? null : null;
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
