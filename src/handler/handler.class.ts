import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { StatusCode } from '../http/enums/status-code.enum';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { Logger } from '../logger/logger.class';
import { env } from '../utils/functions/env.function';

@Service()
export class Handler {
  private error: Error | null = null;

  private caller: string | null = null;

  private errorHandler: ((error: Error) => unknown) | null = null;

  private file: string | null = null;

  private notFoundHandler: (() => unknown) | null = null;

  constructor(
    private logger: Logger,
    private request: Request,
    private response: Response,
  ) {}

  private async readErrorStack(): Promise<void> {
    const stack = this.error?.stack ?? 'Error\n    at <anonymous>:1:1';

    const line = stack.split('\n')[1];

    const at = line?.slice(line.indexOf('at ') + 2, line.length) ?? 'unknown';
    const caller = at.split('(')[0] ?? 'unknown';
    const fileMatch = at.match(/\((.*?)\)/);

    let file = '';

    try {
      file = fileMatch ? fileURLToPath(fileMatch[1]) : 'unknown';

      file = file
        .replace(file.replace(/([^:]*:){2}/, ''), '')
        ?.slice(0, -1)
        ?.replaceAll('\\', '/') ?? file;

      const isAppFile = !file.includes('node_modules') && !file.includes('/core');

      if (isAppFile) {
        file = file.replace(/^.*?dist[/\\]/, `src/`);

        const originalSourceFile = file.replace('.js', '.ts');

        file = existsSync(originalSourceFile) ? originalSourceFile : file;
      } else {
        file = '@northle/core package';
      }
    } catch (err) {
      file = 'unknown';
    }

    this.caller = caller;
    this.file = file;
  }

  public async handleError(error: Error): Promise<void> {
    this.error = error;

    const statusCode = StatusCode.InternalServerError;

    this.response.status(statusCode);

    if (this.errorHandler) {
      this.errorHandler(error);

      return;
    }

    await this.readErrorStack();

    const undefinedVariableRegex = /(.*?) is not defined/;

    const message = undefinedVariableRegex.test(error.message)
      ? error.message.replace(undefinedVariableRegex, '`$1` is not defined')
      : (error.message.charAt(0).toUpperCase() + error.message.slice(1)).replaceAll(
          /\n|\r\n/g,
          ' ',
        );

    this.logger.error(`${message}${this.file ? ` [${this.file}]` : ''}`);

    const data = {
      statusCode,
      message: 'Internal Server Error',
    };

    if (this.request.ajax()) {
      this.response.send(data);

      return;
    }

    if (env<boolean>('DEVELOPMENT')) {
      const customViewTemplate = `views/errors/${statusCode}.html`;

      const view = existsSync(customViewTemplate)
        ? `views/errors/${statusCode}`
        : `${fileURLToPath(import.meta.url)}/../../../views/error`;

      const { caller, file } = this;

      await this.response.render(view, {
        message,
        caller,
        file,
        statusCode,
        method: this.request.method(),
        route: this.request.url(),
      });

      return;
    }

    const customTemplatePath = `views/errors/${statusCode}.html`;

    const file = existsSync(customTemplatePath)
      ? `views/errors/${statusCode}`
      : `${fileURLToPath(import.meta.url)}/../../../views/http`;

    this.response.terminate();

    await this.response.render(file, data);
  }

  public async handleFatalError(error: Error): Promise<void> {
    if (error !== Object(error)) {
      return;
    }

    this.error = error;

    await this.readErrorStack();

    const message = error.message.charAt(0).toUpperCase() + error.message.slice(1);

    this.logger.error(
      `${message}${this.file ? ` [${this.file}]` : ''}`,
      'fatal error',
    );

    if (!env<boolean>('DEVELOPMENT')) {
      process.exit(1);
    }

    this.logger.warn('In production mode process will exit on fatal errors');
  }

  public handleInvalidToken(): void {
    const statusCode = StatusCode.InvalidToken;

    this.response.status(statusCode);

    const data = {
      statusCode,
      message: 'Invalid Token',
    };

    if (this.request.ajax()) {
      this.response.send(data);

      return;
    }

    const customViewTemplate = `views/errors/${statusCode}.html`;

    const view = existsSync(customViewTemplate)
      ? `views/errors/${statusCode}`
      : `${fileURLToPath(import.meta.url)}/../../../views/http`;

    this.response.terminate();

    this.response.render(view, data);
  }

  public handleNotFound(): void {
    const statusCode = StatusCode.NotFound;

    this.response.status(statusCode);

    if (this.notFoundHandler) {
      this.notFoundHandler();

      return;
    }

    const data = {
      statusCode,
      message: 'Not Found',
    };

    if (this.request.ajax()) {
      this.response.send(data);

      return;
    }

    const customViewTemplate = `views/errors/${statusCode}.html`;

    const view = existsSync(customViewTemplate)
      ? `views/errors/${statusCode}`
      : `${fileURLToPath(import.meta.url)}/../../../views/http`;

    this.response.terminate();

    this.response.render(view, data);
  }

  public setErrorHandler(callback: () => unknown): void {
    this.errorHandler = callback;
  }

  public setNotFoundHandler(callback: () => unknown): void {
    this.notFoundHandler = callback;
  }
}
