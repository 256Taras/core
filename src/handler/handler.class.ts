import { env } from '../config/env.function';
import { error } from '../utils/functions/error.function';
import { Exception } from './exception.class';
import { existsSync, readFileSync } from 'fs';
import { getHighlighter } from 'shiki';
import { sep as directorySeparator } from 'path'
import { Request, Response, NextFunction } from 'express';

export class Handler {
  public static async handleException(
    exception: TypeError | Exception,
    request: Request,
    response: Response,
    _next: NextFunction,
  ): Promise<void> {
    response.status(500);

    const message = exception.message.charAt(0).toUpperCase() + exception.message.slice(1);

    error(`Exception: ${message}`);

    const data = {
      status: 500,
      message: 'Server exception',
    };

    if (request.xhr || request.headers.accept?.includes('json')) {
      response.send(data);

      return;
    }

    if (!env<boolean>('APP_DEBUG')) {
      const customTemplatePath = 'views/exceptions/500.atom.html';

      const file = existsSync(customTemplatePath)
        ? customTemplatePath
        : `${__dirname}/../../assets/views/http`;

      response.render(file, data);
    }

    const callerLine: string | undefined = exception.stack?.split('\n')[1];
    const callerIndex: number | undefined = callerLine?.indexOf('at ');
    const info: string | undefined = callerLine?.slice(callerIndex ? callerIndex + 2 : 0, callerLine.length);
    const caller: string | undefined = info?.split('(')[0];

    const fileMatch = info?.match(/\((.*?)\)/);

    let file: string = fileMatch
      ? fileMatch[1]
      : 'unknown';

    const src = readFileSync(file.replace(file.replace(/([^:]*:){2}/, ''), '').slice(0, -1)).toString();

    if (!file.includes('node_modules')) {
      file = file.replace(/.*?\dist./, `src${directorySeparator}`);
      file = file.replace('.js', '.ts');
    } else {
      file = `${require('../../package.json').name} package file`;
    }

    const highlighter = await getHighlighter({
      theme: 'one-dark-pro',
    });

    const code = highlighter.codeToHtml(src, {
      lang: 'ts',
    });

    response.render(`${__dirname}/../../assets/views/exception`, {
      method: request.method.toUpperCase(),
      route: request.url,
      type: exception.constructor.name,
      caller,
      code,
      file,
      message,
    });
  }

  public static handleNotFound(request: Request, response: Response): void {
    response.status(404);

    const data = {
      status: 404,
      message: 'Not Found',
    };

    if (request.xhr || request.headers.accept?.includes('json')) {
      response.send(data);

      return;
    }

    response.render(`${__dirname}/../../assets/views/http`, data);
  }
}