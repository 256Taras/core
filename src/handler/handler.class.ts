import { env } from '../config/env.function';
import { Exception } from './exception.class';
import { existsSync, readFileSync } from 'fs';
import { getHighlighter } from 'shiki';
import { sep as directorySeparator } from 'path'
import { Request, Response, NextFunction } from 'express';
import { warn } from '../utils/functions/warn.function';

export class Handler {
  public static async handleError(
    error: TypeError | Exception,
    request: Request,
    response: Response,
    _next: NextFunction,
  ): Promise<void> {
    response.status(500);

    const message = error.message.charAt(0).toUpperCase() + error.message.slice(1);

    warn(`Exception: ${message}`);

    const data = {
      status: 500,
      message: 'Server Error',
    };

    if (request.xhr || request.headers.accept?.includes('json')) {
      response.send(data);

      return;
    }

    if (!env<boolean>('APP_DEBUG')) {
      const customTemplatePath = 'views/errors/500.atom.html';

      const file = existsSync(customTemplatePath)
        ? customTemplatePath
        : `${__dirname}/../../assets/views/http`;

      response.render(file, data);
    }

    const callerLine: string | undefined = error.stack?.split('\n')[1];
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
      type: error.constructor.name,
      caller,
      code,
      file,
      message,
    });
  }
}