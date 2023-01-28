import { inject } from '../../injector/functions/inject.function.js';
import { DownloadResponse } from '../download-response.service.js';

export function download(file: string) {
  const instance = inject(DownloadResponse);

  instance.setFile(file);

  return instance;
}
