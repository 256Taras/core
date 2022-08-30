import { Response } from './response.class';
import { Session } from '../session/session.class';
import { Compiler } from '../views/compiler.class';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class DownloadResponse extends Response {
  private path: string;

  constructor(compiler: Compiler, session: Session) {
    super(compiler, session);
  }

  public get file(): string {
    return this.path;
  }

  public setFile(file: string): void {
    this.path = file;
  }
}
