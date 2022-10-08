import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { StatusCode } from '../http/enums/status-code.enum';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { Logger } from '../logger/logger.class';
import { env } from '../utils/functions/env.function';
import { StackFileData } from './interfaces/stack-file-data.interface';

@Service()
export class Handler {
  constructor(
    private logger: Logger,
    private request: Request,
    private response: Response,
  ) {}

  private async getErrorStack(error: Error): Promise<StackFileData> {
    const stack = error.stack ?? 'Error\n    at <anonymous>:1:1';

    const line = stack.split('\n')[1];

    const callerData = line.slice(line.indexOf('at ') + 2, line.length);
    const caller = callerData.split('(')[0];
    const fileMatch = callerData.match(/\((.*?)\)/);

    let file = '';

    try {
      file = fileMatch ? fileURLToPath(fileMatch[1]) : '<anonymous>';

      file = file
        .replace(file.replace(/([^:]*:){2}/, ''), '')
        .slice(0, -1)
        .replaceAll('\\', '/');

      const isAppFile = !file.includes('node_modules') && !file.includes('/core');

      if (isAppFile) {
        file = file.replace(/.*?dist./, `src/`).replace('.js', '.ts');

        this.logger.error(file, 'in file');
      } else {
        file = '@northle/core package file';
      }
    } catch (err) {
      file = 'unknown';
    }

    return {
      caller,
      file,
    };
  }

  public async handleError(error: Error): Promise<void> {
    const statusCode = StatusCode.InternalServerError;

    this.response.status(statusCode);

    const undefinedVariableRegex = /(.*?) is not defined/;

    const message = undefinedVariableRegex.test(error.message) ? error.message.replace(undefinedVariableRegex, '`$1` is not defined') :  (
      error.message.charAt(0).toUpperCase() + error.message.slice(1)
    ).replaceAll(/\n|\r\n/g, ' ');

    this.logger.error(message);

    const data = {
      statusCode,
      message: 'Internal Server Error',
    };

    if (this.request.ajax()) {
      this.response.send(data);

      return;
    }

    if (env<boolean>('DEVELOPMENT')) {
      const { caller, file } = await this.getErrorStack(error);

      const customViewTemplate = `views/errors/${statusCode}.html`;

      const view = existsSync(customViewTemplate)
        ? `views/errors/${statusCode}`
        : `${fileURLToPath(import.meta.url)}/../../../views/error`;

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

    await this.response.render(file, data);
  }

  public handleNotFound(): void {
    const statusCode = StatusCode.NotFound;

    this.response.status(statusCode);

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

    this.response.render(view, data);
  }

  public handleInvalidToken(): void {
    const statusCode = StatusCode.TokenExpired;

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

    this.response.render(view, data);
  }

  public handleFatalError(error: Error): void {
    if (error !== Object(error)) {
      return;
    }

    const message = error.message.charAt(0).toUpperCase() + error.message.slice(1);

    this.logger.error(message, 'fatal error');

    if (!env<boolean>('DEVELOPMENT')) {
      process.exit(1);
    }

    this.logger.warn('In production mode process will exit on fatal errors');
  }
}
