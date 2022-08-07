import { Handler } from '../handler/handler.class';
import { Compiler } from './compiler.class';
import { Request, Response } from 'express';
import { promises } from 'node:fs';

export class View {
  public static async parse(
    filePath: string,
    data: Record<string, any>,
    callback: (error: any, rendered?: string | undefined) => void,
  ) {
    const fileContent = await promises.readFile(filePath);
    const html = Compiler.compile(fileContent.toString(), data);

    return callback(null, html);
  }

  public static render(
    request: Request,
    response: Response,
    file: string,
    data: Record<string, any>,
  ): void {
    const viewData = {
      variables: data,
    };

    response.render(file, viewData, (error: Error, html: string) => {
      if (error) {
        Handler.handleException(error, request, response);

        return;
      }

      response.send(html);
    });
  }
}
