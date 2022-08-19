import { Service } from '../injector/decorators/service.decorator';
import { DownloadResponse } from './download-response.class';
import { StatusCode } from './enums/status-code.enum';
import { view } from './functions/view.function';
import { JsonResponse } from './json-response.class';
import { RedirectResponse } from './redirect-response.class';
import { ViewResponse } from './view-response.class';
import { Response as ExpressResponse } from 'express';

@Service()
export class Response {
  private instance: ExpressResponse | null = null;

  public $getInstance(): ExpressResponse | null {
    return this.instance;
  }

  public $setInstance(instance: ExpressResponse): this {
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

  public download(file: string): DownloadResponse {
    return new DownloadResponse(file);
  }

  public end(data: any): this {
    this.instance?.end(data);

    return this;
  }

  public header(header: string, value?: any): any | this {
    if (value === undefined) {
      return this.instance?.get(header);
    }

    this.instance?.header(header, value);

    return this;
  }

  public json(data?: Record<string, any> | undefined): JsonResponse {
    return new JsonResponse(data);
  }

  public redirect(
    url: string,
    status: StatusCode = StatusCode.Found,
  ): RedirectResponse {
    this?.instance?.status(status);

    return new RedirectResponse(url);
  }

  public render(file: string, data: Record<string, any>, callback?: any): this {
    this.instance?.render(file, data, callback);

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
