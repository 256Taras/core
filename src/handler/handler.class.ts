import * as constants from '../constants';
import { env } from '../config/env.function';
import { Exception } from './exception.class';
import { existsSync } from 'fs';
import { sep as directorySeparator } from 'path'
import { Request, Response, NextFunction } from 'express';

export class Handler {
  public static handleError(
    error: TypeError | Exception,
    request: Request,
    response: Response,
    _next: NextFunction,
  ): void {
    response.status(500);

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

    if (file.includes('dist')) {
      file = file.replace(/.*?\.dist./, `src${directorySeparator}`);
      file = file.replace('.js', '.ts');
      file = file.split(':')[0];
    } else {
      file = `${require('../../package.json').name} package file`;
    }

    response.render(`${__dirname}/../../assets/views/exception`, {
      message: error.message.charAt(0).toUpperCase() + error.message.slice(1),
      nucleonVersion: constants.VERSION,
      nodeVersion: process.versions.node,
      file,
      caller,
    });
  }
}