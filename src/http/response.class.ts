import { Exception } from '../handler/exception.class';
import { Service } from '../injector/decorators/service.decorator';
import { StatusCode } from './enums/status-code.enum';
import { ViewRenderer } from '../views/view-renderer.class';
import { FastifyReply } from 'fastify';

@Service()
export class Response {
  private instance: FastifyReply | null = null;

  constructor(private viewRenderer: ViewRenderer) {}

  public $getInstance(): FastifyReply | null {
    return this.instance;
  }

  public $setInstance(instance: FastifyReply): this {
    this.instance = instance;

    return this;
  }

  public cookie(
    cookie: string,
    value: string,
    options: Record<string, any> = {},
  ): this {
    this.instance?.cookie(cookie, value, options);

    return this;
  }

  public deleteCookie(cookie: string): this {
    this.instance?.clearCookie(cookie);

    return this;
  }

  public download(file: string): this {
    this.instance?.download(file);

    return this;
  }

  public header(header: string, value?: any): any | this {
    if (value === undefined) {
      return this.instance?.headers[header as keyof object];
    }

    this.instance?.header(header, value);

    return this;
  }

  public json(data?: Record<string, any>): this {
    this.instance?.send(data);

    return this;
  }

  public redirect(url: string, status: StatusCode = StatusCode.Found): this {
    this?.instance?.status(status);
    this?.instance?.redirect(url);

    return this;
  }

  public render(file: string, data: Record<string, any>): this {
    const html = this.viewRenderer.parse(file, {
      variables: data,
    });

    this.send(html);

    return this;
  }

  public status(status: StatusCode): this {
    this.instance?.status(status);

    return this;
  }

  public send(data: any): this {
    this.instance?.send(data);

    return this;
  }
}
