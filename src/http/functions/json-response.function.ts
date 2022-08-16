import { JsonResponse } from '../json-response.class';

export const jsonResponse = (data?: Record<string, any>) => {
  return new JsonResponse(data);
};
