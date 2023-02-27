import { FastifyReply } from 'fastify';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createErrorTip } from '../handler/functions/create-error-tip.function.js';
import { MIME_TYPES } from '../http/constants.js';
import { Service } from '../injector/decorators/service.decorator.js';
import { RouteUrl } from '../router/types/route-url.type.js';
import { Session } from '../session/session.service.js';
import { TemplateCompiler } from '../templates/template-compiler.service.js';
import { StatusCode } from './enums/status-code.enum.js';
import { CookieOptions } from './interfaces/cookie-options.interface.js';
import { Request } from './request.service.js';
import { inject } from '../injector/functions/inject.function.js';
import { callerFile } from '../utils/functions/caller-file.function.js';
import { resolveViewFile } from '../utils/functions/resolve-view-file.function.js';
import { ViewResponse } from './view-response.service.js';

@Service()
export class Response {
  private instance: FastifyReply | null = null;

  private terminated = false;

  protected request = inject(Request);

  protected session = inject(Session);

  protected templateCompiler = inject(TemplateCompiler);

  public $getInstance(): FastifyReply | null {
    return this.instance;
  }

  public $setInstance(instance: FastifyReply): this {
    this.instance = instance;

    return this;
  }

  public async abort(statusCode: StatusCode, customMessage?: string): Promise<this> {
    this.instance?.status(statusCode);

    const message =
      customMessage ??
      Object.keys(StatusCode)
        .find(
          (key: string) =>
            (StatusCode as unknown as Record<string, StatusCode>)[key] ===
            statusCode,
        )
        ?.replace(/([a-z])([A-Z])/g, '$1 $2') ??
      'Unknown error';

    const data = {
      statusCode,
      message,
    };

    if (this.request.isAjaxRequest()) {
      this.json(data);

      return this;
    }

    this.terminate();

    const view = existsSync(`views/errors/${statusCode}.html`)
      ? `views/errors/${statusCode}`
      : `${fileURLToPath(import.meta.url)}/../../../views/http`;

    await this.render(view, data);

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
    const extension = file.split('.').pop();

    this.header('content-disposition', `attachment; filename=${file}`);

    if (extension) {
      this.header('content-type', MIME_TYPES[extension]);
    }

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
    to: RouteUrl | { name: string; params?: Record<string, string> },
    data: Record<string, unknown> = {},
    status: StatusCode = StatusCode.Found,
  ): this {
    if (Object.keys(data).length) {
      for (const [key, value] of Object.entries(data)) {
        this.session.flash(key, value);
      }
    }

    // TODO: Make it working with named routes
    const url = typeof to === 'string' ? to : '/';

    /*
    TODO: Get route list from the router service
    const url = typeof to === 'string' ? to : routes.find((route) => route.name === to.name)?.url;

    if (!url) {
      throw new Error(`Route '${to.name}' does not exist`);
    }
    */

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
      throw new Error(
        `View '${file}' does not exist`,
        createErrorTip(`Create '${file}' view file`),
      );
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

  public view(file: string, data: Record<string, unknown> = {}): ViewResponse {
    const caller = callerFile();

    return new ViewResponse(resolveViewFile(caller, file), data, true);
  }
}
