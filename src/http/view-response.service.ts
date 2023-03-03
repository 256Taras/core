import { Service } from '../injector/decorators/service.decorator.js';
import { callerFile } from '../utils/functions/caller-file.function.js';
import { resolveViewFile } from '../utils/functions/resolve-view-file.function.js';

@Service()
export class ViewResponse {
  private $data: Record<string, unknown>;

  private $file: string;

  constructor(
    file: string,
    data: Record<string, unknown> = {},
    resolvedUrl = false,
  ) {
    const caller = callerFile();

    file = resolvedUrl ? file : resolveViewFile(caller, file);

    this.$file = file;
    this.$data = data;
  }

  public get data(): Record<string, unknown> {
    return this.$data;
  }

  public get file(): string {
    return this.$file;
  }

  public setData(data: Record<string, unknown> = {}): void {
    this.$data = data;
  }

  public setFile(file: string): void {
    this.$file = file;
  }
}
