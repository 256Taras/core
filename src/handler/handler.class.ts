import { Exception } from './exception.class';
import { Request, Response, NextFunction } from 'express';

export class Handler {
  public static handleError(
    error: TypeError | Exception,
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    response.status(500);

    if (request.xhr || request.headers.accept?.includes('json')) {
      response.send({
        status: 500,
        message: 'Server Error',
      });

      return;
    }

    response.render(`${__dirname}/../../assets/views/exception`, {
      message: error.message,
    });
  }
}