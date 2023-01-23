import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.service';
import { TemplateCompiler } from '../templates/template-compiler.service';
import { Request } from './request.service';
import { Response } from './response.service';

@Service()
export class JsonResponse extends Response {
  private variables: Record<string, unknown>;

  constructor(
    request: Request,
    session: Session,
    templateCompiler: TemplateCompiler,
  ) {
    super(request, session, templateCompiler);
  }

  public get data(): Record<string, unknown> {
    return this.variables;
  }

  public setData(data: Record<string, unknown> = {}): void {
    this.variables = data;
  }
}
