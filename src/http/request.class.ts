import { FastifyRequest } from 'fastify';
import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.class';
import { HttpMethod } from './enums/http-method.enum';
import { File } from './file.class';

interface FormFileField {
  data: Buffer;
  filename: string;
  mimetype: string;
}

@Service()
export class Request {
  private instance: FastifyRequest | null = null;

  constructor(private session: Session) {}

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

  public get body(): Record<string, string> {
    return (this.instance?.body as Record<string, string>) ?? {};
  }

  public get cookies(): Record<string, string | undefined> {
    return this.instance?.cookies ?? {};
  }

  public cookie(cookie: string): string | null {
    return this.cookies[cookie] ?? null;
  }

  public file(name: string): File[] | null {
    return this.files[name] ?? null;
  }

  public get files(): Record<string, File[]> {
    const fields = this.body;
    const result: Record<string, File[]> = {};

    for (const [field, value] of Object.entries<unknown | unknown[]>(fields)) {
      if (
        Array.isArray(value) &&
        (value as unknown[])?.[0] &&
        'filename' in (value[0] as FormFileField)
      ) {
        value.map((file: FormFileField) => {
          const instance = new File(file.filename, file.data, file.mimetype);

          const cleanFieldName = field.replace('[]', '');

          if (!(cleanFieldName in result)) {
            result[cleanFieldName] = [];
          }

          (result[cleanFieldName] as File[]).push(instance);
        });
      }
    }

    return result;
  }

  public form<T>(): T {
    return this.body as unknown as T;
  }

  public has(key: string): boolean {
    return key in this.body;
  }

  public hasHeader(header: string): boolean {
    return header in this.headers;
  }

  public header(header: string): string | string[] | null {
    return this.instance?.headers[header] ?? null;
  }

  public get headers(): Record<string, string | string[] | undefined> {
    return this.instance?.headers ?? {};
  }

  public host(): string | null {
    return this.instance?.hostname ?? null;
  }

  public id(): number {
    return this.session.get<number>('_requestId') ?? 0;
  }

  public input(field: string): string | null {
    return this.body[field] ?? null;
  }

  public ip(): string | null {
    return this.instance?.ip ?? null;
  }

  public ips(): string[] | null {
    return this.instance?.ips ?? null;
  }

  public isFileRequest(): boolean {
    const urlLastSegment = this.url()?.slice(this.url()?.lastIndexOf('/') ?? 1);

    return (
      (urlLastSegment?.includes('.') ?? false) && this.method() === HttpMethod.Get
    );
  }

  public isFormRequest(): boolean {
    return ![HttpMethod.Get, HttpMethod.Head].includes(this.method());
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

  public oldInput(key: string): string {
    return this.session.flash<Record<string, string>>('oldInput')?.[key] ?? '';
  }

  public param(param: string): string | null {
    return this.params[param] ?? null;
  }

  public get params(): Record<string, string> {
    return (this.instance?.params as Record<string, string>) ?? {};
  }

  public previousUrl(): string {
    return this.session.get('_previousLocation') ?? this.url();
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

  public secure(): boolean {
    return this.protocol() === 'https';
  }

  public url(): string {
    return this.instance?.url ?? '/';
  }
}
