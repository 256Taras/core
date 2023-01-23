import { HttpMethod } from '../../http/enums/http-method.enum';
import { inject } from '../../injector/functions/inject.function';
import { Route } from '../interfaces/route.interface';
import { Router } from '../router.service';

export function createRoute(
  url: string,
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
