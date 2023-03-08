import { DownloadResponse } from '../download-response.service.js';

export function download(file: string) {
  return new DownloadResponse(file);
}
