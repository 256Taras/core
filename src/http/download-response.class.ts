import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.class';
import { TemplateCompiler } from '../templates/template-compiler.class';
import { Request } from './request.class';
import { Response } from './response.class';

@Service()
export class DownloadResponse extends Response {
  private path: string;

  constructor(request: Request, session: Session, templateCompiler: TemplateCompiler) {
    super(request, session, templateCompiler);
  }

  public get file(): string {
    return this.path;
  }

  public setFile(file: string): void {
    this.path = file;
  }
}
