import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
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

    let file = fileMatch ? fileURLToPath(fileMatch[1]) : '<anonymous>';

    file = file.replace(file.replace(/([^:]*:){2}/, ''), '').slice(0, -1);

    const isAppFile = !file.includes('node_modules') && !file.includes('/core');

    if (isAppFile) {
      file = file.replace(/.*?dist./, `src/`).replace('.js', '.ts');
    } else {
      const packageData = await readFile(
        `${fileURLToPath(import.meta.url)}/../../../package.json`,
      );

      file = `${JSON.parse(packageData.toString()).name} package file`;
    }

    return {
      caller,
      file,
    };
  }

  public async handleError(error: Error): Promise<void> {
    const statusCode = StatusCode.InternalServerError;

    this.response.status(statusCode);

    const message = (
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

    if (!env<boolean>('NORTHER_DEV')) {
      const customTemplatePath = `views/errors/${statusCode}.north.html`;

      const file = existsSync(customTemplatePath)
        ? `views/errors/${statusCode}`
        : `${fileURLToPath(import.meta.url)}/../../../views/http`;

      this.response.render(file, data);
    }

    const { caller, file } = await this.getErrorStack(error);

    const customViewTemplate = `views/errors/${statusCode}.north.html`;

    const view = existsSync(customViewTemplate)
      ? `views/errors/${statusCode}`
      : `${fileURLToPath(import.meta.url)}/../../../views/error`;

    this.response.render(view, {
      message,
      caller,
      file,
      statusCode,
      method: this.request.method(),
      route: this.request.url(),
    });
  }

  public handleNotFound(): void {
    const statusCode = StatusCode.NotFound;

    this.response.status(statusCode);

    const data = {
      statusCode,
      message: 'Page Not Found',
    };

    if (this.request.ajax()) {
      this.response.send(data);

      return;
    }

    const customViewTemplate = `views/errors/${statusCode}.north.html`;

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

    const customViewTemplate = `views/errors/${statusCode}.north.html`;

    const view = existsSync(customViewTemplate)
      ? `views/errors/${statusCode}`
      : `${fileURLToPath(import.meta.url)}/../../../views/http`;

    this.response.render(view, data);
  }

  public handleUncaughtError(error: Error): void {
    if (error !== Object(error)) {
      return;
    }

    const message = error.message.charAt(0).toUpperCase() + error.message.slice(1);

    this.logger.error(message, 'uncaught error');

    if (!env<boolean>('NORTHER_DEV')) {
      process.exit(1);
    }

    this.logger.warn('In production mode process will exit');
  }
}
