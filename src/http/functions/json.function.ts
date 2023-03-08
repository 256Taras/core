import { JsonResponse } from '../json-response.service.js';

export function json(data: Record<string, unknown> = {}) {
  return new JsonResponse(data);
}
