import { inject } from '../../injector/functions/inject.function';
import { JsonResponse } from '../json-response.class';

export const json = (data: Record<string, unknown> = {}) => {
  const instance = inject(JsonResponse);

  instance.setData(data);

  return instance;
};
