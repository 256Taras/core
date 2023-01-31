import { DownloadResponse } from '../../http/download-response.service.js';
import { JsonResponse } from '../../http/json-response.service.js';
import { RedirectBackResponse } from '../../http/redirect-back-response.service.js';
import { RedirectResponse } from '../../http/redirect-response.service.js';
import { ViewResponse } from '../../http/view-response.service.js';

export type ResponseContent =
  | DownloadResponse
  | JsonResponse
  | RedirectBackResponse
  | RedirectResponse
  | ViewResponse
  | null
  | undefined;
