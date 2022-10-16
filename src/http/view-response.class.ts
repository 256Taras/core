import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.class';
import { ViewCompiler } from '../views/view-compiler.class';
import { Request } from './request.class';
import { Response } from './response.class';

@Service()
export class ViewResponse extends Response {
  private path: string;

  private variables: Record<string, unknown>;

  constructor(request: Request, session: Session, viewCompiler: ViewCompiler) {
    super(request, session, viewCompiler);
  }

  public get data(): Record<string, unknown> {
    return this.variables;
  }

  public get file(): string {
    return this.path;
  }

  public setData(data: Record<string, unknown> = {}): void {
    this.variables = data;
  }

  public setFile(file: string): void {
    this.path = file;
  }
}
