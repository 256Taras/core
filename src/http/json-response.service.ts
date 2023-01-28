import { Service } from '../injector/decorators/service.decorator.js';
import { Session } from '../session/session.service.js';
import { TemplateCompiler } from '../templates/template-compiler.service.js';
import { Request } from './request.service.js';
import { Response } from './response.service.js';

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
