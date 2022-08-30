import { JsonResponse } from '../json-response.class';
import { inject } from '../../injector/functions/inject.function';

export const json = (data: Record<string, any> = {}) => {
  const instance = inject(JsonResponse);

  instance.setData(data);

  return instance;
};
