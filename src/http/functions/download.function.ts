import { DownloadResponse } from '../download-response.class';
import { inject } from '../../injector/functions/inject.function';

export const download = (file: string) => {
  const instance = inject(DownloadResponse);

  instance.setFile(file);

  return instance;
};
