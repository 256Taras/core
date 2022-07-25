import { env } from '../config/env.function';
import { error } from '../utils/functions/error.function';
import { Exception } from './exception.class';
import { View } from '../views/view.class';
import { NextFunction, Request, Response } from 'express';
import { existsSync, promises, readFileSync } from 'node:fs';
import { sep as directorySeparator } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getHighlighter } from 'shiki';

export class Handler {
  public static async handleException(
    exception: Error | TypeError | Exception,
    request: Request,
    response: Response,
    _next?: NextFunction,
  ): Promise<void> {
    response.status(500);

    const message =
      exception.message.charAt(0).toUpperCase() + exception.message.slice(1);

    error(message, 'exception');

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
        : `${fileURLToPath(import.meta.url)}/../../../assets/views/http`;

      response.render(file, data);
    }

    const stack = exception.stack ?? 'Error\n    at <anonymous>:1:1';

    const callerLine = stack.split('\n')[1];
    const callerIndex = callerLine.indexOf('at ');
    const info = callerLine.slice(callerIndex + 2, callerLine.length);
    const caller = info.split('(')[0];

    const fileMatch = info.match(/\((.*?)\)/);

    let file = fileMatch ? fileMatch[1] : '<anonymous>';

    const path = file.replace(file.replace(/([^:]*:){2}/, ''), '').slice(0, -1);

    const src = existsSync(path)
      ? readFileSync(path).toString()
      : '';

    if (!file.includes('node_modules')) {
      file = file.replace(/.*?dist./, `src${directorySeparator}`);
      file = file.replace('.js', '.ts');
    } else {
      file = `${
        JSON.parse(
          (
            await promises.readFile(
              `${fileURLToPath(import.meta.url)}/../../../package.json`,
            )
          ).toString(),
        ).name
      } package file`;
    }

    const highlighter = await getHighlighter({
      theme: 'one-dark-pro',
    });

    const code = highlighter.codeToHtml(src, {
      lang: 'ts',
    });

    View.render(request, response, `${fileURLToPath(import.meta.url)}/../../../assets/views/exception`, {
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

    View.render(request, response, `${fileURLToPath(import.meta.url)}/../../../assets/views/http`, data);
  }

  public static handleInvalidToken(request: Request, response: Response): void {
    response.status(419);

    const data = {
      status: 419,
      message: 'Invalid Token',
    };

    if (request.xhr || request.headers.accept?.includes('json')) {
      response.send(data);

      return;
    }

    View.render(request, response, `${fileURLToPath(import.meta.url)}/../../../assets/views/http`, data);
  }
}
