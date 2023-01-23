import { inject } from '../../injector/functions/inject.function';
import { JsonResponse } from '../json-response.service';

export function json(data: Record<string, unknown> = {}) {
  const instance = inject(JsonResponse);

  instance.setData(data);

  return instance;
}
