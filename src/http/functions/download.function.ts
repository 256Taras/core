import { inject } from '../../injector/functions/inject.function';
import { DownloadResponse } from '../download-response.class';

export const download = (file: string) => {
  const instance = inject(DownloadResponse);

  instance.setFile(file);

  return instance;
};
