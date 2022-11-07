import { FastifyReply } from 'fastify';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.class';
import { ViewCompiler } from '../views/view-compiler.class';
import { StatusCode } from './enums/status-code.enum';
import { Request } from './request.class';
import { CookieOptions } from './interfaces/cookie-options.interface';

@Service()
export class Response {
  private instance: FastifyReply | null = null;

  constructor(
    private request: Request,
    private session: Session,
    private viewCompiler: ViewCompiler,
  ) {}

  public $getInstance(): FastifyReply | null {
    return this.instance;
  }

  public $setInstance(instance: FastifyReply): this {
    this.instance = instance;

    return this;
  }

  public async abort(status: StatusCode): Promise<this> {
    this.instance?.status(status);

    const message = Object.keys(StatusCode)
      .find(
        (key: string) =>
          (StatusCode as unknown as Record<string, StatusCode>)[key] === status,
      )
      ?.replace(/([a-z])([A-Z])/g, '$1 $2');

    const data = {
      statusCode: status,
      message,
    };

    if (this.request.ajax()) {
      this.json(data);

      return this;
    }

    await this.render(`${fileURLToPath(import.meta.url)}/../../../views/http`, data);

    return this;
  }

  public cookie(
    cookie: string,
    value: string,
    options: CookieOptions = {},
  ): this {
    this.instance?.cookie(cookie, value, options);

    return this;
  }

  public csrfToken(): string | null {
    const token = this.session.get<string>('_csrfToken');

    return token;
  }

  public deleteCookie(cookie: string): this {
    this.instance?.clearCookie(cookie);

    return this;
  }

  public download(file: string): this {
    this.instance?.download(file);

    return this;
  }

  public header(
    headers: string | Record<string, string>,
    value?: string,
  ): string | string[] | number | null | this {
    if (value === undefined) {
      return this.instance?.getHeader(headers as string) ?? null;
    }

    if (typeof headers !== 'string') {
      this.instance?.headers(headers);
    }

    this.instance?.header(headers as string, value);

    return this;
  }

  public headers(headers: Record<string, string>): this {
    this.instance?.headers(headers);

    return this;
  }

  public json(data?: Record<string, unknown>): this {
    this.instance?.send(data);

    return this;
  }

  public redirect(
    url: string,
    data: Record<string, unknown> = {},
    status: StatusCode = StatusCode.Found,
  ): this {
    if (!Object.keys(data).length) {
      this.session.set('_redirectData', data);
    }

    this.instance?.status(status);
    this.instance?.redirect(url);

    return this;
  }

  public redirectBack(
    data: Record<string, unknown> = {},
    status: StatusCode = StatusCode.Found,
  ): this {
    if (!Object.keys(data).length) {
      this.session.set('_redirectData', data);
    }

    this.instance?.status(status);
    this.instance?.redirect(this.session.get('_previousLocation') ?? '/');

    return this;
  }

  public async render(
    file: string,
    data: Record<string, unknown> = {},
  ): Promise<this> {
    if (!file.endsWith('.html')) {
      file = `${file}.html`;
    }

    if (!existsSync(file)) {
      throw new Error(`View '${file}' does not exist`);
    }

    const fileContent = readFileSync(file);

    const html = await this.viewCompiler.compile(fileContent.toString(), data, file);

    this.send(html);

    return this;
  }

  public status(status: StatusCode): this {
    this.instance?.status(status);

    return this;
  }

  public send<T = unknown>(data: T): this {
    this.header('content-type', 'text/html; charset=utf8');
    this.instance?.send(data);

    return this;
  }
}
