import { inject } from '../../injector/functions/inject.function.js';
import { callerFile } from '../../utils/functions/caller-file.function.js';
import { resolveViewFile } from '../../utils/functions/resolve-view-file.function.js';
import { ViewResponse } from '../view-response.service.js';

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
