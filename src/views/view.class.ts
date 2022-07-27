import { Handler } from '../handler/handler.class';
import { Compiler } from './compiler.class';
import { Request, Response } from 'express';
import { readFileSync } from 'node:fs';

export class View {
  public static parse(
    filePath: string,
    data: Record<string, any>,
    callback: (error: any, rendered?: string | undefined) => void,
  ) {
    const html = Compiler.compile(readFileSync(filePath).toString(), data);

    return callback(null, html);
  }

  public static render(
    request: Request,
    response: Response,
    filePath: string,
    data: Record<string, any>,
  ): void {
    const viewData = {
      variables: data,
    };

    response.render(filePath, viewData, (error: Error, html: string) => {
      if (error) {
        Handler.handleException(error, request, response);

        return;
      }

      response.send(html);
    });
  }
}
