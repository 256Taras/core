import { Response } from './response.class';
import { Session } from '../session/session.class';
import { Compiler } from '../views/compiler.class';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class ViewResponse extends Response {
  private path: string;

  private variables: Record<string, any>;

  constructor(compiler: Compiler, session: Session) {
    super(compiler, session);
  }

  public get data(): Record<string, any> {
    return this.variables;
  }

  public get file(): string {
    return this.path;
  }

  public setData(data: Record<string, any> = {}): void {
    this.variables = data;
  }

  public setFile(file: string): void {
    this.path = file;
  }
}
