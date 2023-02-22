import { Reflection as Reflect } from '@abraham/reflection';
import { Handler } from '../../handler/handler.service.js';
import { HttpMethod } from '../../http/enums/http-method.enum.js';
import { StatusCode } from '../../http/enums/status-code.enum.js';
import { MiddlewareHandler } from '../../http/interfaces/middleware-handler.interface.js';
import { Request } from '../../http/request.service.js';
import { Response } from '../../http/response.service.js';
import { inject } from '../../injector/functions/inject.function.js';
import { Session } from '../../session/session.service.js';
import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { Integer } from '../../utils/types/integer.type.js';
import { MethodDecorator } from '../../utils/types/method-decorator.type.js';
import { RouteOptions } from '../interfaces/route-options.interface.js';
import { Router } from '../router.service.js';
import { RouteUrl } from '../types/route-url.type.js';

const handler = inject(Handler);
const request = inject(Request);
const response = inject(Response);
const router = inject(Router);
const session = inject(Session);

function defineRouteMetadata(target: object | Function, options?: RouteOptions) {
  Reflect.defineMetadata(
    'maxRequestsPerMinute',
    options?.maxRequestsPerMinute,
    target,
  );
  Reflect.defineMetadata('middleware', options?.middleware, target);
  Reflect.defineMetadata('redirectUrl', options?.redirectTo, target);
  Reflect.defineMetadata('statusCode', options?.statusCode, target);
}

function resolveUrl(url: RouteUrl, controller: Constructor): RouteUrl {
  let baseUrl = Reflect.getMetadata<RouteUrl>('baseUrl', controller);

  if (baseUrl && baseUrl.length > 1 && baseUrl.charAt(0) !== '/') {
    baseUrl = `/${baseUrl}`;
  }

  return baseUrl ? `${baseUrl}/${url}` : url;
}

function resolveRouteAction(
  target: object | Function,
  propertyKey: string | symbol,
) {
  return async (...args: unknown[]) => {
    const middleware:
      | Constructor<MiddlewareHandler>
      | Constructor<MiddlewareHandler>[]
      | undefined = Reflect.getMetadata('middleware', target);

    if (middleware) {
      const items = Array.isArray(middleware) ? middleware : [middleware];

      items.map((item) => {
        const instance = inject(item);

        instance.handle();
      });
    }

    const redirectUrl = Reflect.getMetadata<RouteUrl>('redirectUrl', target);

    if (redirectUrl) {
      const response = inject(Response);

      response.redirect(
        redirectUrl,
        {},
        Reflect.getMetadata('redirectStatus', target),
      );

      return;
    }

    const statusCode = Reflect.getMetadata<StatusCode>('statusCode', target);

    if (statusCode) {
      response.status(statusCode);
    }

    const maxRequestsPerMinute = Reflect.getMetadata<Integer>(
      'maxRequestsPerMinute',
      target,
    );

    if (
      maxRequestsPerMinute !== undefined &&
      (session.get<Integer[]>(`_lastMinuteRequests:${request.url()}`) ?? [])
        .length >= maxRequestsPerMinute
    ) {
      await handler.handleTooManyRequests();
    }

    await router.respond(target.constructor as Constructor, propertyKey, ...args);
  };
}

function createRouteDecorator(methods: HttpMethod[], options?: RouteOptions) {
  return (url: RouteUrl): MethodDecorator => {
    return (target, propertyKey) => {
      defineRouteMetadata(target, options);

      const callback = resolveRouteAction(target, propertyKey);

      methods.map((method) => {
        router.createRoute(
          resolveUrl(url, target.constructor as Constructor),
          method,
          callback,
        );
      });
    };
  };
}

export function Error(
  statusCode:
    | StatusCode.InternalServerError
    | StatusCode.NotFound
    | StatusCode.TooManyRequests,
): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    handler.setCustomHandler(statusCode, callback);
  };
}

export function Methods(
  methods: HttpMethod[],
  url: RouteUrl,
  options?: RouteOptions,
): MethodDecorator {
  return (target, propertyKey) => {
    defineRouteMetadata(target, options);

    const callback = resolveRouteAction(target, propertyKey);

    methods.map((method) => {
      router.createRoute(
        resolveUrl(url, target.constructor as Constructor),
        method,
        callback,
      );
    });
  };
}

export const Any = createRouteDecorator(Object.values(HttpMethod));

export const Copy = createRouteDecorator([HttpMethod.Copy]);

export const Delete = createRouteDecorator([HttpMethod.Delete]);

export const Get = createRouteDecorator([HttpMethod.Get]);

export const Head = createRouteDecorator([HttpMethod.Head]);

export const Lock = createRouteDecorator([HttpMethod.Lock]);

export const Mkcol = createRouteDecorator([HttpMethod.Mkcol]);

export const Move = createRouteDecorator([HttpMethod.Move]);

export const Options = createRouteDecorator([HttpMethod.Options]);

export const Patch = createRouteDecorator([HttpMethod.Patch]);

export const Post = createRouteDecorator([HttpMethod.Post]);

export const PropFind = createRouteDecorator([HttpMethod.PropFind]);

export const PropPatch = createRouteDecorator([HttpMethod.PropPatch]);

export const Put = createRouteDecorator([HttpMethod.Put]);

export const Search = createRouteDecorator([HttpMethod.Search]);

export const Trace = createRouteDecorator([HttpMethod.Trace]);

export const Unlock = createRouteDecorator([HttpMethod.Unlock]);
