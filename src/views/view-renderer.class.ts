import { Exception } from '../handler/exception.class';
import { Service } from '../injector/decorators/service.decorator';
import { Compiler } from './compiler.class';
import { Response } from 'express';
import { promises } from 'node:fs';

@Service()
export class ViewRenderer {
  constructor(private compiler: Compiler) {}

  public async parse(
    file: string,
    data: Record<string, any>,
    callback: (error: any, rendered?: string | undefined) => void,
  ) {
    const fileContent = await promises.readFile(file);
    const html = this.compiler.compile(fileContent.toString(), data);

    return callback(null, html);
  }

  public render(response: Response, file: string, data: Record<string, any>): void {
    const viewData = {
      variables: data,
    };

    response.render(file, viewData, (error: Error, html: string): void | never => {
      if (error) {
        throw new Exception(error.message);
      }

      response.send(html);
    });
  }
}
