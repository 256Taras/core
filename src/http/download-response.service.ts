import { Service } from '../injector/decorators/service.decorator';
import { Session } from '../session/session.service';
import { TemplateCompiler } from '../templates/template-compiler.service';
import { Request } from './request.service';
import { Response } from './response.service';

@Service()
export class DownloadResponse extends Response {
  private path: string;

  constructor(
    request: Request,
    session: Session,
    templateCompiler: TemplateCompiler,
  ) {
    super(request, session, templateCompiler);
  }

  public get file(): string {
    return this.path;
  }

  public setFile(file: string): void {
    this.path = file;
  }
}
