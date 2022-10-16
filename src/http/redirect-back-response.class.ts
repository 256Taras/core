import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.class';
import { ViewCompiler } from '../views/view-compiler.class';
import { StatusCode } from './enums/status-code.enum';
import { Request } from './request.class';
import { Response } from './response.class';

@Service()
export class RedirectBackResponse extends Response {
  private variables: Record<string, unknown>;

  private httpStatus: StatusCode;

  constructor(request: Request, session: Session, viewCompiler: ViewCompiler) {
    super(request, session, viewCompiler);
  }

  public get data(): Record<string, unknown> {
    return this.variables;
  }

  public get statusCode(): StatusCode {
    return this.httpStatus;
  }

  public setData(data: Record<string, unknown> = {}): void {
    this.variables = data;
  }

  public setStatus(status: StatusCode = StatusCode.Found): void {
    this.httpStatus = status;
  }
}
