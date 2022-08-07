import { JsonResponse } from '../json-response.class';
import { RedirectResponse } from '../redirect-response.class';
import { Service } from '../../injector/decorators/service.decorator';
import { Response as Res } from 'express';
import { Code } from '../enums/code.enum';

@Service()
export class Response {
  private instance: Res | null = null;

  public __setInstance(instance: Res): this {
    this.instance = instance;

    return this;
  }

  public cookie(cookie: string, value: string, options: Record<string, any> = {}): this {
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

  public redirect(url: string, status: Code = Code.Found): RedirectResponse {
    this?.instance?.status(status);

    return new RedirectResponse(url);
  }
}
