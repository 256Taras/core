import { StatusCode } from './enums/status-code.enum';
import { Response } from './response.class';
import { Session } from '../session/session.class';
import { Compiler } from '../views/compiler.class';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class RedirectResponse extends Response {
  private path: string;

  private variables: Record<string, any>;

  private httpStatus: StatusCode;

  constructor(compiler: Compiler, session: Session) {
    super(compiler, session);
  }

  public get data(): Record<string, any> {
    return this.variables;
  }

  public get statusCode(): StatusCode {
    return this.httpStatus;
  }

  public get url(): string {
    return this.path;
  }

  public setData(data: Record<string, any> = {}): void {
    this.variables = data;
  }

  public setStatus(status: StatusCode = StatusCode.Found): void {
    this.httpStatus = status;
  }

  public setUrl(url: string): void {
    this.path = url;
  }
}
