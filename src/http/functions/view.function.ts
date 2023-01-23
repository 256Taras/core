import { inject } from '../../injector/functions/inject.function';
import { callerFile } from '../../utils/functions/caller-file.function';
import { resolveViewFile } from '../../utils/functions/resolve-view-file.function';
import { ViewResponse } from '../view-response.service';

export function view(
  file: string,
  data: Record<string, unknown> = {},
): ViewResponse {
  const caller = callerFile();

  file = resolveViewFile(caller, file);

  const instance = inject(ViewResponse);

  instance.setData(data);
  instance.setFile(file);

  return instance;
}
