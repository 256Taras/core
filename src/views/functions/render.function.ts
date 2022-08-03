import { ViewResponse } from '../../http/view-response.class';
import { getCallerFile } from '../../utils/functions/get-caller-file.function';

export const render = (file: string, data?: Record<string, any>): ViewResponse => {
  const callerFile = getCallerFile();
  throw new Error('test')

  if (file.startsWith('./')) {
    file = `${callerFile}/../${file.slice(2)}`;
  }

  return new ViewResponse(file, data);
};
