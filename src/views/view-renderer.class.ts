import { Service } from '../injector/decorators/service.decorator';
import { Compiler } from './compiler.class';
import { promises } from 'node:fs';

@Service()
export class ViewRenderer {
  constructor(private compiler: Compiler) {}

  public async parse(file: string, data: Record<string, any>): Promise<string> {
    const fileContent = await promises.readFile(file);
    const html = this.compiler.compile(fileContent.toString(), data);

    return html;
  }
}
