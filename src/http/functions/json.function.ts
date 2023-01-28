import { inject } from '../../injector/functions/inject.function.js';
import { JsonResponse } from '../json-response.service.js';

export function json(data: Record<string, unknown> = {}) {
  const instance = inject(JsonResponse);

  instance.setData(data);

  return instance;
}
