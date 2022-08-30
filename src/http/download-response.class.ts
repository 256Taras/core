import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.class';
import { ViewCompiler } from '../views/view-compiler.class';
import { Response } from './response.class';

@Service()
export class DownloadResponse extends Response {
  private path: string;

  constructor(viewCompiler: ViewCompiler, session: Session) {
    super(viewCompiler, session);
  }

  public get file(): string {
    return this.path;
  }

  public setFile(file: string): void {
    this.path = file;
  }
}
