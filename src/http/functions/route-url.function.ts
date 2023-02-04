import { inject } from '../../injector/functions/inject.function.js';
import { RouteUrl } from '../../router/types/route-url.type.js';
import { Request } from '../request.service.js';

export function routeUrl(route: RouteUrl) {
  const request = inject(Request);

  return `${request.protocol}://${request.host}${route}`;
}
