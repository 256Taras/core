import { inject } from '../../injector/functions/inject.function';
import { callerFile } from '../../utils/functions/caller-file.function';
import { ViewResponse } from '../view-response.class';

export const view = (file: string, data: Record<string, any> = {}): ViewResponse => {
  const caller = callerFile();

  if (file.startsWith('./')) {
    file = `${caller}/../${file.slice(2)}`;
  }

  const instance = inject(ViewResponse);

  instance.setData(data);
  instance.setFile(file);

  return instance;
};
