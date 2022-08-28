import { StatusCode } from '../http/enums/status-code.enum';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { Logger } from '../logger/logger.class';
import { env } from '../utils/functions/env.function';
import { StackFileData } from './interfaces/stack-file-data.interface';
import { existsSync, promises, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getHighlighter } from 'shiki';

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

    const callerData = line.slice(
      line.indexOf('at ') + 2,
      line.length,
    );

    const caller = callerData.split('(')[0];
    const fileMatch = callerData.match(/\((.*?)\)/);

    let file = fileMatch ? fileMatch[1] : '<anonymous>';

    const filePath = file.replace(file.replace(/([^:]*:){2}/, ''), '').slice(0, -1);
    const fileContent = existsSync(filePath) ? readFileSync(filePath).toString() : null;
    const isAppFile = !file.includes('node_modules') && !file.includes('/core');

    if (isAppFile) {
      file = file.replace(/.*?dist./, `src/`).replace('.js', '.ts');
    } else {
      const packageData = await promises.readFile(
        `${fileURLToPath(import.meta.url)}/../../../package.json`,
      );

      file = `${JSON.parse(packageData.toString()).name} package file`;
    }

    return {
      caller,
      file,
      fileContent,
      isAppFile,
    };
  }

  public async handleError(error: Error): Promise<void> {
    this.response.status(StatusCode.InternalServerError);

    const message = (
      error.message.charAt(0).toUpperCase() + error.message.slice(1)
    ).replaceAll(/\n|\r\n/g, ' ');

    this.logger.error(message, 'error');

    const data = {
      statusCode: StatusCode.InternalServerError,
      message: 'Internal Server Error',
    };

    if (this.request.ajax() || this.request.headers.accept?.includes('json')) {
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

    const { caller, file, fileContent, isAppFile } = await this.getErrorStack(error);

    const highlighter = getHighlighter({
      theme: 'one-dark-pro',
    });

    const codeSnippet = fileContent
      ? (await highlighter).codeToHtml(fileContent, {
          lang: 'ts',
        })
      : null;

    const customViewTemplate = 'views/errors/500.north.html';

    const view = existsSync(customViewTemplate)
      ? 'views/errors/500'
      : `${fileURLToPath(import.meta.url)}/../../../assets/views/error`;

    this.response.render(view, {
      codeSnippet: fileContent && isAppFile ? codeSnippet : null,
      method: this.request.method().toUpperCase(),
      route: this.request.url(),
      type: error.constructor.name,
      caller,
      file,
      message,
    });
  }

  public handleNotFound(): void {
    this.response.status(StatusCode.NotFound);

    const data = {
      statusCode: StatusCode.NotFound,
      message: 'Page Not Found',
    };

    if (this.request.ajax() || this.request.headers.accept?.includes('json')) {
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

    if (this.request.ajax() || this.request.headers.accept?.includes('json')) {
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
