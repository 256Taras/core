import { Handler } from '../handler/handler.class';
import { Compiler } from './compiler.class';
import { Service } from '../injector/decorators/service.decorator';
import { Request, Response } from 'express';
import { promises } from 'node:fs';

@Service()
export class ViewRenderer {
  constructor(private compiler: Compiler, private handler: Handler) {}

  public async parse(
    filePath: string,
    data: Record<string, any>,
    callback: (error: any, rendered?: string | undefined) => void,
  ) {
    const fileContent = await promises.readFile(filePath);
    const html = this.compiler.compile(fileContent.toString(), data);

    return callback(null, html);
  }

  public render(
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
        this.handler.handleException(error, request, response);

        return;
      }

      response.send(html);
    });
  }
}
