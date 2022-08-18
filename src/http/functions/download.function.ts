import { DownloadResponse } from '../download-response.class';

export const download = (file: string) => {
  return new DownloadResponse(file);
};
