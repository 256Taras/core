import { FastifyReply } from 'fastify';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.class';
import { TemplateCompiler } from '../templates/template-compiler.class';
import { StatusCode } from './enums/status-code.enum';
import { CookieOptions } from './interfaces/cookie-options.interface';
import { Request } from './request.class';

@Service()
export class Response {
  private instance: FastifyReply | null = null;

  private terminated = false;

  constructor(
    private request: Request,
    private session: Session,
    private templateCompiler: TemplateCompiler,
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

    if (this.request.isAjaxRequest()) {
      this.json(data);

      return this;
    }

    await this.render(`${fileURLToPath(import.meta.url)}/../../../views/http`, data);

    return this;
  }

  public cookie(cookie: string, value: string, options: CookieOptions = {}): this {
    this.instance?.cookie(cookie, value, options);

    return this;
  }

  public csrfToken(): string | null {
    return this.session.get<string>('_csrfToken');
  }

  public deleteCookie(cookie: string): this {
    this.instance?.clearCookie(cookie);

    return this;
  }

  public deleteHeader(header: string): this {
    this.instance?.removeHeader(header);

    return this;
  }

  public download(file: string): this {
    this.instance?.download(file);

    return this;
  }

  public hasHeader(header: string): boolean {
    return this.instance?.hasHeader(header) ?? false;
  }

  public header(
    header: string,
    value?: string,
  ): string | string[] | number | null | this {
    if (value === undefined) {
      return this.instance?.getHeader(header) ?? null;
    }

    this.instance?.header(header, value);

    return this;
  }

  public headers(
    headers?: Record<string, string | string[] | number>,
  ): Record<string, string | string[] | number | undefined> | this {
    if (headers === undefined) {
      return this.instance?.getHeaders() ?? {};
    }

    this.instance?.headers(headers);

    return this;
  }

  public isTerminated(): boolean {
    return this.terminated;
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
    if (Object.keys(data).length) {
      for (const [key, value] of Object.entries(data)) {
        this.session.flash(key, value);
      }
    }

    this.instance?.redirect(url);
    this.instance?.status(status);

    return this;
  }

  public redirectBack(
    data: Record<string, unknown> = {},
    status: StatusCode = StatusCode.Found,
  ): this {
    if (Object.keys(data).length) {
      for (const [key, value] of Object.entries(data)) {
        this.session.flash(key, value);
      }
    }

    this.instance?.redirect(
      this.session.get('_previousLocation') ?? this.request.url(),
    );
    this.instance?.status(status);

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
      throw new Error(`View '${file}' does not exist`, {
        cause: new Error(`Create '${file}' view file`),
      });
    }

    const fileContent = await readFile(file, 'utf8');

    const html = await this.templateCompiler.compile(
      fileContent.toString(),
      data,
      file,
    );

    TemplateCompiler.stacks.clear();

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

  public terminate(terminate = true): void {
    this.terminated = terminate;
  }
}
