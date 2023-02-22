import { fileURLToPath } from 'node:url';
import { Configurator } from '../configurator/configurator.service.js';
import { env } from '../configurator/functions/env.function.js';
import { StatusCode } from '../http/enums/status-code.enum.js';
import { HttpError } from '../http/http-error.class.js';
import { Request } from '../http/request.service.js';
import { Response } from '../http/response.service.js';
import { Service } from '../injector/decorators/service.decorator.js';
import { Logger } from '../logger/logger.service.js';
import { Integer } from '../utils/types/integer.type.js';

@Service()
export class Handler {
  private error: Error | null = null;

  private caller: string | null = null;

  private errorHandler: ((error: Error) => unknown) | null = null;

  private file: string | null = null;

  private line: number | null = null;

  private notFoundHandler: (() => unknown) | null = null;

  private tooManyRequestsHandler: (() => unknown) | null = null;

  constructor(
    private configurator: Configurator,
    private logger: Logger,
    private request: Request,
    private response: Response,
  ) {}

  private async readErrorStack(): Promise<void> {
    const stack = this.error?.stack ?? 'Error\n    at <anonymous>:1:1';

    if (env<boolean>('DEVELOPER_MODE') ?? false) {
      console.log(stack);
    }

    const where = stack.split('\n')[1];

    const at = where?.slice(where.indexOf('at ') + 2, where.length) ?? 'unknown';
    const caller = at.split('(')[0] ?? 'unknown';
    const fileMatch = at.match(/\((.*?)\)/);

    let file = '';
    let line: Integer | null = +(fileMatch?.[1]?.match(/(.*):(.*):(.*)/)?.[2] ?? 1);

    if (file.includes('/node_modules') && file.includes('/core')) {
      file = '@northle/core package file';
      line = null;
    } else {
      try {
        file = fileMatch ? fileURLToPath(fileMatch[1]) : 'unknown';
      } catch {
        file = 'unknown';
      }

      file =
        `src/${file
          .replace(file.replace(/([^:]*:){2}/, ''), '')
          ?.slice(0, -1)
          ?.replaceAll('\\', '/')
          ?.split('src/')?.[1] ?? file}`;
    }

    this.caller = caller;
    this.file = file;
    this.line = line;
  }

  public async handleError(error: Error): Promise<void> {
    if (error instanceof HttpError) {
      await this.response.abort(error.statusCode, error.message);

      return;
    }

    this.error = error;

    const statusCode = StatusCode.InternalServerError;

    this.response.status(statusCode);

    if (this.errorHandler) {
      this.errorHandler(error);

      return;
    }

    await this.readErrorStack();

    const message = /(.*?) is not defined/.test(error.message)
      ? error.message
      : (error.message.charAt(0).toUpperCase() + error.message.slice(1)).replaceAll(
          /\n|\r\n/g,
          ' ',
        );

    this.logger.error(message);

    this.logger.sub('-----');

    if (this.file) {
      this.logger.sub(`in file: ${this.file}`);
    }

    if (this.line && this.file && this.file !== 'unknown') {
      this.logger.sub(`in line: ${this.line}`);
    }

    if (this.request.fullUrl()) {
      this.logger.sub(`on route: ${this.request.fullUrl()}`);
    }

    if (this.request.ip()) {
      this.logger.sub(`from IP: ${this.request.ip()}`);
    }

    if (!this.request.isAjaxRequest() && (this.configurator.entries?.development ?? env<boolean>('DEVELOPMENT'))) {
      await this.response.render(`${fileURLToPath(import.meta.url)}/../../../views/error`, {
        caller: this.caller,
        error,
        file: this.file,
        line: this.line,
        message,
      });

      return;
    }

    await this.response.abort(statusCode);
  }

  public async handleFatalError(error: Error): Promise<void> {
    if (error !== Object(error)) {
      return;
    }

    this.error = error;

    await this.readErrorStack();

    const message = error.message.charAt(0).toUpperCase() + error.message.slice(1);

    this.logger.error(message, 'fatal error');

    if (this.file) {
      this.logger.sub(`File: ${this.file} in line ${this.line}`);
    }

    if (!(this.configurator.entries?.development ?? env<boolean>('DEVELOPMENT'))) {
      process.exit(1);
    }

    this.logger.warn('In production mode process will exit on fatal errors');
  }

  public async handleInvalidToken(): Promise<void> {
    await this.response.abort(StatusCode.InvalidToken);
  }

  public async handleNotFound(): Promise<void> {
    if (this.notFoundHandler) {
      this.notFoundHandler();

      return;
    }

    await this.response.abort(StatusCode.NotFound);
  }

  public async handleTooManyRequests(): Promise<void> {
    if (this.tooManyRequestsHandler) {
      this.tooManyRequestsHandler();

      return;
    }

    await this.response.abort(StatusCode.TooManyRequests);
  }

  public setErrorHandler(callback: () => unknown): void {
    this.errorHandler = callback;
  }

  public setNotFoundHandler(callback: () => unknown): void {
    this.notFoundHandler = callback;
  }

  public setTooManyRequestsHandler(callback: () => unknown): void {
    this.tooManyRequestsHandler = callback;
  }

  public useDefaultErrorHandler(): void {
    this.errorHandler = null;
  }

  public useDefaultNotFound(): void {
    this.notFoundHandler = null;
  }
}
