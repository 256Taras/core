import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.class';
import { TemplateCompiler } from '../templates/template-compiler.class';
import { Request } from './request.class';
import { Response } from './response.class';

@Service()
export class ViewResponse extends Response {
  private path: string;

  private variables: Record<string, unknown>;

  constructor(request: Request, session: Session, templateCompiler: TemplateCompiler) {
    super(request, session, templateCompiler);
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
