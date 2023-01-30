import { HttpMethod } from '../../http/enums/http-method.enum.js';
import { inject } from '../../injector/functions/inject.function.js';
import { Route } from '../interfaces/route.interface.js';
import { Router } from '../router.service.js';
import { RouteUrl } from '../types/route-url.type.js';

export function createRoute(
  url: RouteUrl,
  method: HttpMethod,
  action: () => unknown,
): Route {
  const router = inject(Router);

  router.createRoute(url, method, action);

  return {
    url,
    method,
    action,
  };
}
