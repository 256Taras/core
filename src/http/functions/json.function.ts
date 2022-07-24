import { JsonResponse } from '../json-response.class';

export const json = (data?: Record<string, any>) => {
  return new JsonResponse(data);
}
