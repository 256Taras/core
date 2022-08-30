import { existsSync, promises } from 'node:fs';
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

    const file = fileMatch ? fileURLToPath(fileMatch[1]) : '<anonymous>';

    let filePath = file.replace(file.replace(/([^:]*:){2}/, ''), '').slice(0, -1);

    const isAppFile = !filePath.includes('node_modules') && !filePath.includes('/core');

    if (!isAppFile) {
      const packageData = await promises.readFile(
        `${fileURLToPath(import.meta.url)}/../../../package.json`,
      );

      filePath = `${JSON.parse(packageData.toString()).name} package file`;
    }

    return {
      caller,
      file: filePath,
    };
  }

  public async handleError(error: Error): Promise<void> {
    this.response.status(StatusCode.InternalServerError);

    const message = (
      error.message.charAt(0).toUpperCase() + error.message.slice(1)
    ).replaceAll(/\n|\r\n/g, ' ');

    this.logger.error(message);

    const data = {
      statusCode: StatusCode.InternalServerError,
      message: 'Internal Server Error',
    };

    if (this.request.ajax()) {
      this.response.send(data);

      return;
    }

    if (!env<boolean>('APP_DEBUG')) {
      const customTemplatePath = 'views/errors/500.north.html';

      const file = existsSync(customTemplatePath)
        ? 'views/errors/500'
        : `${fileURLToPath(import.meta.url)}/../../../assets/views/http`;

      this.response.render(file, data);
    }

    const { caller, file } = await this.getErrorStack(error);

    const customViewTemplate = 'views/errors/500.north.html';

    const view = existsSync(customViewTemplate)
      ? 'views/errors/500'
      : `${fileURLToPath(import.meta.url)}/../../../assets/views/error`;

    this.response.render(view, {
      message,
      caller,
      file,
      method: this.request.method(),
      route: this.request.url(),
      statusCode: StatusCode.InternalServerError,
    });
  }

  public handleNotFound(): void {
    this.response.status(StatusCode.NotFound);

    const data = {
      statusCode: StatusCode.NotFound,
      message: 'Page Not Found',
    };

    if (this.request.ajax()) {
      this.response.send(data);

      return;
    }

    const customViewTemplate = 'views/errors/404.north.html';

    const view = existsSync(customViewTemplate)
      ? 'views/errors/404'
      : `${fileURLToPath(import.meta.url)}/../../../assets/views/http`;

    this.response.render(view, data);
  }

  public handleInvalidToken(): void {
    this.response.status(StatusCode.TokenExpired);

    const data = {
      statusCode: StatusCode.TokenExpired,
      message: 'Invalid Token',
    };

    if (this.request.ajax()) {
      this.response.send(data);

      return;
    }

    const customViewTemplate = 'views/errors/419.north.html';

    const view = existsSync(customViewTemplate)
      ? 'views/errors/419'
      : `${fileURLToPath(import.meta.url)}/../../../assets/views/http`;

    this.response.render(view, data);
  }

  public handleUncaughtException(error: any): void {
    if (error !== Object(error)) {
      return;
    }

    const message = error.message.charAt(0).toUpperCase() + error.message.slice(1);

    this.logger.error(message, 'uncaught error');

    if (!env<boolean>('APP_DEBUG')) {
      process.exit(1);
    }

    this.logger.warn('In production mode process will exit');
  }
}
