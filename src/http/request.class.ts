import { Service } from '../injector/decorators/service.decorator';
import { HttpMethod } from './enums/http-method.enum';
import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';

@Service()
export class Request {
  private instance: FastifyRequest | null = null;

  public $getInstance(): FastifyRequest | null {
    return this.instance;
  }

  public $setInstance(instance: FastifyRequest): void {
    this.instance = instance;
  }

  public ajax(): boolean {
    return (
      this.header('x-requested-with') === 'XMLHttpRequest' ||
      (this.header('accept') ?? '').includes('application/json')
    );
  }

  public get body(): Record<string, any> {
    return (this.instance?.body as Record<string, any>) ?? {};
  }

  public get cookies(): Record<string, any> {
    return this.instance?.cookies ?? {};
  }

  public cookie(cookie: string): any {
    return this.cookies[cookie] ?? null;
  }

  public get files(): AsyncIterableIterator<MultipartFile> | undefined {
    return this.instance?.files();
  }

  public file(file: string): MultipartFile | null {
    return this.files?.[file as keyof object] ?? null;
  }

  public get headers(): Record<string, any> {
    return this.instance?.headers ?? {};
  }

  public header(header: string): string | string[] | null {
    return this.instance?.headers[header] ?? null;
  }

  public host(): string | null {
    return this.instance?.hostname ?? null;
  }

  public input(field: string): any {
    return this.body[field] ?? null;
  }

  public ip(): string | null {
    return this.instance?.ip ?? null;
  }

  public ips(): string[] | null {
    return this.instance?.ips ?? null;
  }

  public method(): HttpMethod {
    const methods = {
      get: HttpMethod.Get,
      post: HttpMethod.Post,
      put: HttpMethod.Put,
      patch: HttpMethod.Patch,
      delete: HttpMethod.Delete,
      head: HttpMethod.Head,
      options: HttpMethod.Options,
    };

    return (
      methods[(this.instance?.method ?? 'get').toLowerCase() as keyof object] ??
      HttpMethod.Get
    );
  }

  public get params(): Record<string, any> {
    return (this.instance?.params as Record<string, any>) ?? {};
  }

  public param(param: string): any {
    return this.params ? this.params[param] ?? null : null;
  }

  public protocol(): string | null {
    return this.instance?.protocol ?? null;
  }

  public get query(): Record<string, any> {
    return (this.instance?.query as Record<string, any>) ?? {};
  }

  public redirectData(): Record<string, any> | null {
    return this.session._redirectData ?? null;
  }

  public secure(): boolean {
    return this.protocol() === 'https';
  }

  public get session(): Record<string, any> {
    return this.instance?.session ?? {};
  }

  public token(): string | null {
    return this.session._token ?? null;
  }

  public url(): string | null {
    return this.instance?.url ?? null;
  }
}
