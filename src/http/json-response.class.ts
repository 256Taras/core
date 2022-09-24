import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.class';
import { ViewCompiler } from '../views/view-compiler.class';
import { Request } from './request.class';
import { Response } from './response.class';

@Service()
export class JsonResponse extends Response {
  private variables: Record<string, any>;

  constructor(request: Request, session: Session, viewCompiler: ViewCompiler) {
    super(request, session, viewCompiler);
  }

  public get data(): Record<string, any> {
    return this.variables;
  }

  public setData(data: Record<string, any> = {}): void {
    this.variables = data;
  }
}
