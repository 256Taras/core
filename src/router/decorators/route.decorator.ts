import { Reflection as Reflect } from '@abraham/reflection';
import { Handler } from '../../handler/handler.class';
import { HttpMethod } from '../../http/enums/http-method.enum';
import { MiddlewareHandler } from '../../http/interfaces/middleware-handler.interface';
import { Request } from '../../http/request.class';
import { Response } from '../../http/response.class';
import { inject } from '../../injector/functions/inject.function';
import { StatusCode } from '../../http/enums/status-code.enum';
import { Session } from '../../session/session.class';
import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Integer } from '../../utils/types/integer.type';
import { MethodDecorator } from '../../utils/types/method-decorator.type';
import { Router } from '../router.class';

const handler = inject(Handler);
const request = inject(Request);
const response = inject(Response);
const router = inject(Router);
const session = inject(Session);

function resolveUrl(url: string, controller: Constructor) {
  let baseUrl: string | undefined = Reflect.getMetadata('baseUrl', controller);

  if (baseUrl && baseUrl.length > 1 && baseUrl.charAt(0) !== '/') {
    baseUrl = `/${baseUrl}`;
  }

  return baseUrl ? `${baseUrl}/${url}` : url;
}

function resolveRouteAction(target: Constructor, propertyKey: string | symbol) {
  return async (...args: unknown[]) => {
    const middleware: Constructor<MiddlewareHandler> | undefined =
      Reflect.getMetadata('middleware', target);

    if (middleware) {
      const instance = inject(middleware);

      instance.handle();
    }

    const redirectUrl: string | undefined = Reflect.getMetadata(
      'redirectUrl',
      target,
    );

    if (redirectUrl) {
      const response = inject(Response);

      response.redirect(
        redirectUrl,
        {},
        Reflect.getMetadata('redirectStatus', target),
      );

      return;
    }

    const statusCode: StatusCode | undefined =
      Reflect.getMetadata('statusCode', target);

    if (statusCode) {
      response.status(statusCode);
    }

    const maxRequestsPerMinute: Integer | undefined = Reflect.getMetadata(
      'maxRequestsPerMinute',
      target,
    );

    if (
      maxRequestsPerMinute !== undefined &&
      (session.get<Integer[]>(`_lastMinuteRequests:${request.url()}`) ?? [])
        .length >= maxRequestsPerMinute
    ) {
      handler.handleTooManyRequests();
    }

    await router.respond(target.constructor as Constructor, propertyKey, ...args);
  };
}

function createRouteDecorator(methods: HttpMethod[]) {
  return (url: string): MethodDecorator => {
    return (target, propertyKey) => {
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

export function Error(statusCode: 404 | 500): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    if (statusCode === 500) {
      handler.setErrorHandler(callback);
    } else {
      handler.setNotFoundHandler(callback);
    }
  };
}

export function Methods(methods: HttpMethod[], url: string): MethodDecorator {
  return (target, propertyKey) => {
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
