import { Service } from '../injector/decorators/service.decorator.js';
import { Session } from '../session/session.service.js';
import { TemplateCompiler } from '../templates/template-compiler.service.js';
import { Request } from './request.service.js';
import { Response } from './response.service.js';

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
