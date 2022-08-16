import { DownloadResponse } from '../download-response.class';

export const downloadResponse = (file: string) => {
  return new DownloadResponse(file);
};
