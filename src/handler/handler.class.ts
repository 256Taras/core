import { Service } from '../injector/decorators/service.decorator';
import { Logger } from '../logger/logger.class';
import { env } from '../utils/functions/env.function';
import { ViewRenderer } from '../views/view-renderer.class';
import { Exception } from './exception.class';
import { Request, Response } from 'express';
import { existsSync, promises, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getHighlighter } from 'shiki';

interface StackFileData {
  caller: string;
  content: string | null;
  file: string;
  isAppFile: boolean;
}

@Service()
export class Handler {
  constructor(private logger: Logger, private viewRenderer: ViewRenderer) {}

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
    request: Request,
    response: Response,
  ): Promise<void> {
    response.status(500);

    const message =
      exception.message.charAt(0).toUpperCase() + exception.message.slice(1);

    this.logger.error(message, 'exception');

    const data = {
      statusCode: 500,
      message: 'Server exception',
    };

    if (request.xhr || request.headers.accept?.includes('json')) {
      response.send(data);

      return;
    }

    if (!env<boolean>('APP_DEBUG')) {
      const customTemplatePath = 'views/errors/500.atom.html';

      const file = existsSync(customTemplatePath)
        ? 'errors/500'
        : `${fileURLToPath(import.meta.url)}/../../../assets/views/http`;

      response.render(file, data);
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

    const customViewTemplate = 'views/errors/500.atom.html';

    const viewFile = existsSync(customViewTemplate)
      ? 'errors/500'
      : `${fileURLToPath(import.meta.url)}/../../../assets/views/exception`;

    this.viewRenderer.render(response, viewFile, {
      codeSnippet: content && isAppFile ? codeSnippet : null,
      method: request.method.toUpperCase(),
      route: request.url,
      type: exception.constructor.name,
      caller,
      file,
      message,
    });
  }

  public handleNotFound(request: Request, response: Response): void {
    response.status(404);

    const data = {
      statusCode: 404,
      message: 'Not Found',
    };

    if (request.xhr || request.headers.accept?.includes('json')) {
      response.send(data);

      return;
    }

    const customViewTemplate = 'views/errors/404.atom.html';

    const viewFile = existsSync(customViewTemplate)
      ? 'errors/404'
      : `${fileURLToPath(import.meta.url)}/../../../assets/views/http`;

    this.viewRenderer.render(response, viewFile, data);
  }

  public handleInvalidToken(request: Request, response: Response): void {
    response.status(419);

    const data = {
      statusCode: 419,
      message: 'Invalid Token',
    };

    if (request.xhr || request.headers.accept?.includes('json')) {
      response.send(data);

      return;
    }

    const customViewTemplate = 'views/errors/419.atom.html';

    const viewFile = existsSync(customViewTemplate)
      ? 'errors/419'
      : `${fileURLToPath(import.meta.url)}/../../../assets/views/http`;

    this.viewRenderer.render(response, viewFile, data);
  }
}
