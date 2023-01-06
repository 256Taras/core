import { Reflection as Reflect } from '@abraham/reflection';
import { Handler } from '../../handler/handler.class';
import { HttpMethod } from '../../http/enums/http-method.enum';
import { MiddlewareHandler } from '../../http/interfaces/middleware-handler.interface';
import { Response } from '../../http/response.class';
import { inject } from '../../injector/functions/inject.function';
import { Constructor } from '../../utils/interfaces/constructor.interface';
import { MethodDecorator } from '../../utils/types/method-decorator.type';
import { Router } from '../router.class';

const router = inject(Router);

function resolveUrl(url: string, controller: Constructor) {
  let baseUrl: string | undefined = Reflect.getMetadata('baseUrl', controller);

  if (baseUrl && baseUrl.length > 1 && baseUrl.charAt(0) !== '/') {
    baseUrl = `/${baseUrl}`;
  }

  return baseUrl ? `${baseUrl}/${url}` : url;
}

function resolveRouteAction(target: Constructor, propertyKey: string | symbol) {
  return async (...args: unknown[]) => {
    const redirectUrl: string | undefined = Reflect.getMetadata(
      'redirectUrl',
      target,
    );

    const middleware: Constructor<MiddlewareHandler> | undefined =
      Reflect.getMetadata('middleware', target);

    if (middleware) {
      const instance = inject(middleware);

      instance.handle();
    }

    if (redirectUrl) {
      const response = inject(Response);

      response.redirect(
        redirectUrl,
        {},
        Reflect.getMetadata('redirectStatus', target),
      );

      return;
    }

    await router.respond(target.constructor as Constructor, propertyKey, ...args);
  };
}

export function Error(statusCode: 404 | 500): MethodDecorator {
  const handler = inject(Handler);

  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    if (statusCode === 500) {
      handler.setErrorHandler(callback);
    } else {
      handler.setNotFoundHandler(callback);
    }
  };
}

export function Any(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    for (const method of Object.values(HttpMethod)) {
      router.addRoute(
        resolveUrl(url, target.constructor as Constructor),
        method,
        callback,
      );
    }
  };
}

export function Methods(methods: HttpMethod[], url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    methods.map((method) => {
      router.addRoute(
        resolveUrl(url, target.constructor as Constructor),
        method,
        callback,
      );
    });
  };
}

export function Copy(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Copy,
      callback,
    );
  };
}

export function Delete(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Delete,
      callback,
    );
  };
}

export function Get(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Get,
      callback,
    );
  };
}

export function Head(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Head,
      callback,
    );
  };
}

export function Lock(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Lock,
      callback,
    );
  };
}

export function Mkcol(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Mkcol,
      callback,
    );
  };
}

export function Move(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Move,
      callback,
    );
  };
}

export function Options(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Options,
      callback,
    );
  };
}

export function Patch(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Patch,
      callback,
    );
  };
}

export function Post(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Post,
      callback,
    );
  };
}

export function PropFind(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.PropFind,
      callback,
    );
  };
}

export function PropPatch(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.PropPatch,
      callback,
    );
  };
}

export function Put(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Put,
      callback,
    );
  };
}

export function Search(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Search,
      callback,
    );
  };
}

export function Trace(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Trace,
      callback,
    );
  };
}

export function Unlock(url: string): MethodDecorator {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Unlock,
      callback,
    );
  };
}
