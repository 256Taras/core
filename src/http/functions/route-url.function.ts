import { inject } from '../../injector/functions/inject.function.js';
import { Request } from '../request.service.js';

export function routeUrl() {
  const request = inject(Request);

  return request.fullUrl();
}
