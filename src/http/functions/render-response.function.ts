import { ViewResponse } from '../view-response.class';
import { getCallerFile } from '../../utils/functions/get-caller-file.function';

export const renderResponse = (file: string, data?: Record<string, any>): ViewResponse => {
  const callerFile = getCallerFile();

  if (file.startsWith('./')) {
    file = `${callerFile}/../${file.slice(2)}`;
  }

  return new ViewResponse(file, data);
};
