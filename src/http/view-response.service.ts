import { Service } from '../injector/decorators/service.decorator.js';
import { callerFile } from '../utils/functions/caller-file.function.js';
import { resolveViewFile } from '../utils/functions/resolve-view-file.function.js';

@Service()
export class ViewResponse {
  constructor(
    public readonly file: string,
    public readonly data: Record<string, unknown> = {},
    resolvedUrl = false,
  ) {
    const caller = callerFile();

    this.file = resolvedUrl ? file : resolveViewFile(caller, file);
  }
}
