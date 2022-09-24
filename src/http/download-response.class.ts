import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.class';
import { ViewCompiler } from '../views/view-compiler.class';
import { Request } from './request.class';
import { Response } from './response.class';

@Service()
export class DownloadResponse extends Response {
  private path: string;

  constructor(request: Request, session: Session, viewCompiler: ViewCompiler) {
    super(request, session, viewCompiler);
  }

  public get file(): string {
    return this.path;
  }

  public setFile(file: string): void {
    this.path = file;
  }
}
