import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.class';
import { Compiler } from '../views/compiler.class';
import { StatusCode } from './enums/status-code.enum';
import { FastifyReply } from 'fastify';
import { readFileSync } from 'node:fs';

@Service()
export class Response {
  private instance: FastifyReply | null = null;

  constructor(private compiler: Compiler, private session: Session) {}

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

  public header(headers: string | Record<string, string>, value?: any): any | this {
    if (value === undefined) {
      return this.instance?.getHeader(headers as string);
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

  public json(data?: Record<string, any>): this {
    this.instance?.send(data);

    return this;
  }

  public redirect(url: string, data: Record<string, any> = {}, status: StatusCode = StatusCode.Found): this {
    if (!Object.keys(data).length) {
      this.session.set('_redirectData', data);
    }

    this.instance?.status(status);
    this.instance?.redirect(url);

    return this;
  }

  public redirectBack(data: Record<string, any> = {}, status: StatusCode = StatusCode.Found): this {
    if (!Object.keys(data).length) {
      this.session.set('_redirectData', data);
    }

    this.instance?.status(status);
    this.instance?.redirect(this.session.data._previousUrl);

    return this;
  }

  public render(file: string, data: Record<string, any>): this {
    const fileContent = readFileSync(`${file}.north.html`);

    const html = this.compiler.compile(fileContent.toString(), {
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
    this.header('content-type', 'text/html; charset=utf8');
    this.instance?.send(data);

    return this;
  }
}
