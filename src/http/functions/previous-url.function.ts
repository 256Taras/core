import { inject } from '../../injector/functions/inject.function.js';
import { Request } from '../request.service.js';

export function previousUrl() {
  const request = inject(Request);

  return request.previousUrl();
}
