import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';
import { Service } from '../injector/decorators/service.decorator';
import { HttpMethod } from './enums/http-method.enum';
import { Session } from '../session/session.class';
import { Encrypter } from '../crypto/encrypter.class';

@Service()
export class Request {
  private instance: FastifyRequest | null = null;

  constructor(private encrypter: Encrypter, private session: Session) {}

  public $getInstance(): FastifyRequest | null {
    return this.instance;
  }

  public $setInstance(instance: FastifyRequest): this {
    this.instance = instance;

    return this;
  }

  public ajax(): boolean {
    return (
      this.header('x-requested-with') === 'XMLHttpRequest' ||
      (this.header('accept') ?? '').includes('application/json')
    );
  }

  public get body(): Record<string, unknown> {
    return (this.instance?.body as Record<string, unknown>) ?? {};
  }

  public get cookies(): Record<string, string | undefined> {
    return this.instance?.cookies ?? {};
  }

  public cookie(cookie: string): string | null {
    return this.cookies[cookie] ?? null;
  }

  public file(file: string): MultipartFile | null {
    return this.files?.[file as keyof object] ?? null;
  }

  public get files(): AsyncIterableIterator<MultipartFile> | undefined {
    return this.instance?.files();
  }

  public has(field: string): boolean {
    return this.input(field) ? true : false;
  }

  public get headers(): Record<string, unknown> {
    return this.instance?.headers ?? {};
  }

  public header(header: string): string | string[] | null {
    return this.instance?.headers[header] ?? null;
  }

  public host(): string | null {
    return this.instance?.hostname ?? null;
  }

  public input<T = string>(field: string): T | null {
    return (this.body[field] as T) ?? null;
  }

  public ip(): string | null {
    return this.instance?.ip ?? null;
  }

  public ips(): string[] | null {
    return this.instance?.ips ?? null;
  }

  public isFileRequest(): boolean {
    const urlLastSegment = this.url()?.slice(this.url()?.lastIndexOf('/') ?? 0 + 1);

    return (urlLastSegment?.includes('.') ?? false) && this.method() === HttpMethod.Get;
  }

  public locale(): string | string[] {
    return this.header('accept-language')?.slice(0, 2) ?? 'en';
  }

  public method(): HttpMethod {
    const method = this.input('_method')
      ? this.input('_method')
      : this.instance?.method ?? HttpMethod.Get;

    return (
      Object.values(HttpMethod).filter((value) => value === method)[0] ??
      HttpMethod.Get
    );
  }

  public nonce(): string {
    return this.encrypter.uuid();
  }

  public param(param: string): string | null {
    return this.params[param] ?? null;
  }

  public get params(): Record<string, string> {
    return (this.instance?.params as Record<string, string>) ?? {};
  }

  public protocol(): string | null {
    return this.instance?.protocol ?? null;
  }

  public query(key: string): string {
    return (this.instance?.query as Record<string, string>)[key];
  }

  public get queryString(): Record<string, string> {
    return (this.instance?.query as Record<string, string>) ?? {};
  }

  public redirectData(): Record<string, unknown> | null {
    return this.session.get<Record<string, unknown>>('_redirectData') ?? null;
  }

  public secure(): boolean {
    return this.protocol() === 'https';
  }

  public url(): string | null {
    return this.instance?.url ?? null;
  }
}
