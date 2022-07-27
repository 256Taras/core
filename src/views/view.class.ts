import { Compiler } from './compiler.class';
import { Handler } from '../handler/handler.class';
import { Request, Response } from 'express';
import { encode } from 'html-entities';
import { readFileSync } from 'node:fs';

export class View {
  public static parse(
    filePath: string,
    data: Record<string, any>,
    callback: (e: any, rendered?: string | undefined) => void,
  ) {
    let html = readFileSync(filePath).toString();

    html = Compiler.parseRawDirectives(html);
    html = Compiler.parseDataRenders(html, data);
    html = Compiler.restoreRawContent(html);

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
