import { Handler } from '../../handler/handler.service.js';
import { HttpMethod } from '../../http/enums/http-method.enum.js';
import { StatusCode } from '../../http/enums/status-code.enum.js';
import { inject } from '../../injector/functions/inject.function.js';
import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { MethodDecorator } from '../../utils/types/method-decorator.type.js';
import { RouteOptions } from '../interfaces/route-options.interface.js';
import { Router } from '../router.service.js';
import { RouteUrl } from '../types/route-url.type.js';

const handler = inject(Handler);
const router = inject(Router);

export const Any = router.$createRouteDecorator(Object.values(HttpMethod));

export const Copy = router.$createRouteDecorator([HttpMethod.Copy]);

export const Delete = router.$createRouteDecorator([HttpMethod.Delete]);

export const Get = router.$createRouteDecorator([HttpMethod.Get]);

export const Head = router.$createRouteDecorator([HttpMethod.Head]);

export const Lock = router.$createRouteDecorator([HttpMethod.Lock]);

export const Mkcol = router.$createRouteDecorator([HttpMethod.Mkcol]);

export const Move = router.$createRouteDecorator([HttpMethod.Move]);

export const Options = router.$createRouteDecorator([HttpMethod.Options]);

export const Patch = router.$createRouteDecorator([HttpMethod.Patch]);

export const Post = router.$createRouteDecorator([HttpMethod.Post]);

export const PropFind = router.$createRouteDecorator([HttpMethod.PropFind]);

export const PropPatch = router.$createRouteDecorator([HttpMethod.PropPatch]);

export const Put = router.$createRouteDecorator([HttpMethod.Put]);

export const Search = router.$createRouteDecorator([HttpMethod.Search]);

export const Trace = router.$createRouteDecorator([HttpMethod.Trace]);

export const Unlock = router.$createRouteDecorator([HttpMethod.Unlock]);

export function Error(
  statusCode:
    | StatusCode.InternalServerError
    | StatusCode.NotFound
    | StatusCode.TooManyRequests,
): MethodDecorator {
  return (originalMethod, context) => {
    const callback = router.$resolveRouteAction(originalMethod, context.name);

    handler.setCustomHandler(statusCode, callback);

    return originalMethod;
  };
}

export function Methods(
  methods: HttpMethod[],
  url: RouteUrl,
  options?: RouteOptions,
): MethodDecorator {
  return (originalMethod, context) => {
    router.$defineRouteMetadata(originalMethod, options);

    const callback = router.$resolveRouteAction(originalMethod, context.name);

    methods.map((method) => {
      router.createRoute(
        router.$resolveUrl(url, originalMethod.constructor as Constructor),
        method,
        callback,
      );
    });

    return originalMethod;
  };
}
