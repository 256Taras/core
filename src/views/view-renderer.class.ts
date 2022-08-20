import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { Compiler } from './compiler.class';
import { promises } from 'node:fs';

@Service()
export class ViewRenderer {
  constructor(private compiler: Compiler, private response: Response) {}

  public async parse(
    file: string,
    data: Record<string, any>,
    callback: (error: any, rendered?: string | undefined) => void,
  ) {
    const fileContent = await promises.readFile(file);
    const html = this.compiler.compile(fileContent.toString(), data);

    return callback(null, html);
  }
}
