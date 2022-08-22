import { Service } from '../injector/decorators/service.decorator';
import { Compiler } from '../views/compiler.class';
import { StatusCode } from './enums/status-code.enum';
import { FastifyReply } from 'fastify';
import { promises } from 'node:fs';

@Service()
export class Response {
  private instance: FastifyReply | null = null;

  constructor(private compiler: Compiler) {}

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
    this.instance?.status(status);
    this.instance?.redirect(url);

    return this;
  }

  public async render(file: string, data: Record<string, any>): Promise<this> {
    const fileContent = await promises.readFile(`${file}.north.html`);

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
    this.instance?.send(data);

    return this;
  }
}
