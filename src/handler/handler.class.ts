import { StatusCode } from '../http/enums/status-code.enum';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { Logger } from '../logger/logger.class';
import { env } from '../utils/functions/env.function';
import { Exception } from './exception.class';
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

  private async getExceptionStack(
    exception: Error | TypeError | Exception,
  ): Promise<StackFileData> {
    const stack = exception.stack ?? 'Error\n    at <anonymous>:1:1';

    const callerLine = stack.split('\n')[1];
    const callerInfo = callerLine.slice(
      callerLine.indexOf('at ') + 2,
      callerLine.length,
    );
    const caller = callerInfo.split('(')[0];

    const fileMatch = callerInfo.match(/\((.*?)\)/);

    let file = fileMatch ? fileMatch[1] : '<anonymous>';

    const path = file.replace(file.replace(/([^:]*:){2}/, ''), '').slice(0, -1);

    const content = existsSync(path) ? readFileSync(path).toString() : null;
    const isAppFile = !file.includes('node_modules') && !file.includes('/core');

    if (isAppFile) {
      file = file.replace(/.*?dist./, `src/`);
      file = file.replace('.js', '.ts');
    } else {
      const packageData = await promises.readFile(
        `${fileURLToPath(import.meta.url)}/../../../package.json`,
      );

      file = `${JSON.parse(packageData.toString()).name} package file`;
    }

    return {
      caller,
      content,
      file,
      isAppFile,
    };
  }

  public async handleException(
    exception: Error | TypeError | Exception,
  ): Promise<void> {
    this.response.status(StatusCode.InternalServerError);

    const message = (
      exception.message.charAt(0).toUpperCase() + exception.message.slice(1)
    ).replaceAll(/\n|\r\n/g, ' ');

    this.logger.error(message, 'exception');

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
        ? 'errors/500'
        : `${fileURLToPath(import.meta.url)}/../../../assets/views/http`;

      this.response.render(file, data);
    }

    const { caller, content, file, isAppFile } = await this.getExceptionStack(
      exception,
    );

    const highlighter = await getHighlighter({
      theme: 'one-dark-pro',
    });

    const codeSnippet = content
      ? highlighter.codeToHtml(content, {
          lang: 'ts',
        })
      : null;

    const customViewTemplate = 'views/errors/500.north.html';

    const view = existsSync(customViewTemplate)
      ? 'errors/500'
      : `${fileURLToPath(import.meta.url)}/../../../assets/views/exception`;

    this.response.render(view, {
      codeSnippet: content && isAppFile ? codeSnippet : null,
      method: this.request.method().toUpperCase(),
      route: this.request.path(),
      type: exception.constructor.name,
      caller,
      file,
      message,
    });
  }

  public handleNotFound(): void {
    this.response.status(StatusCode.NotFound);

    const data = {
      statusCode: StatusCode.NotFound,
      message: 'Not Found',
    };

    if (this.request.ajax() || this.request.headers.accept?.includes('json')) {
      this.response.send(data);

      return;
    }

    const customViewTemplate = 'views/errors/404.north.html';

    const view = existsSync(customViewTemplate)
      ? 'errors/404'
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
      ? 'errors/419'
      : `${fileURLToPath(import.meta.url)}/../../../assets/views/http`;

    this.response.render(view, data);
  }

  public handleUncaughtException(exception: any): void {
    if (exception !== Object(exception)) {
      return;
    }

    const message =
      exception.message.charAt(0).toUpperCase() + exception.message.slice(1);

    this.logger.error(message, 'uncaught exception');

    if (!env<boolean>('APP_DEBUG')) {
      process.exit(1);
    }
  }
}
