import { callerFile } from '../../utils/functions/caller-file.function.js';
import { resolveViewFile } from '../../utils/functions/resolve-view-file.function.js';
import { ViewResponse } from '../view-response.service.js';

export function view(
  file: string,
  data: Record<string, unknown> = {},
): ViewResponse {
  const caller = callerFile();

  return new ViewResponse(resolveViewFile(caller, file), data, true);
}
