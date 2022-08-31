import { Reflection as Reflect } from '@abraham/reflection';
import { HttpMethod } from '../../http/enums/http-method.enum';
import { inject } from '../../injector/functions/inject.function';
import { Response } from '../../http/response.class';
import { Constructor } from '../../utils/interfaces/constructor.interface';
import { MethodDecorator } from '../../utils/types/method-decorator.type';
import { Router } from '../router.class';

const router = inject(Router);

const resolveUrl = (url: string, controller: Constructor) => {
  let baseUrl: string | undefined = Reflect.getMetadata('baseUrl', controller);

  if (baseUrl && baseUrl.length > 1 && baseUrl.charAt(0) !== '/') {
    baseUrl = `/${baseUrl}`;
  }

  return baseUrl ? `${baseUrl}/${url}` : url;
};

const resolveRouteAction = (target: any, propertyKey: string | symbol) => {
  return async () => {
    const redirectUrl: string | undefined = Reflect.getMetadata('redirectUrl', target);

    if (redirectUrl) {
      const response = inject(Response);

      response.redirect(redirectUrl, {}, Reflect.getMetadata('redirectStatus', target));

      return;
    }

    await router.respond(target.constructor as Constructor, propertyKey);
  };
};

export const Any = (url: string): MethodDecorator => {
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
};

export const Methods = (methods: HttpMethod[], url: string): MethodDecorator => {
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
};

export const Copy = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Copy,
      callback,
    );
  };
};

export const Delete = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Delete,
      callback,
    );
  };
};

export const Get = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Get,
      callback,
    );
  };
};

export const Head = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Head,
      callback,
    );
  };
};

export const Lock = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Lock,
      callback,
    );
  };
};

export const Mkcol = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Mkcol,
      callback,
    );
  };
};

export const Move = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Move,
      callback,
    );
  };
};

export const Options = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Options,
      callback,
    );
  };
};

export const Patch = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Patch,
      callback,
    );
  };
};

export const Post = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Post,
      callback,
    );
  };
};

export const PropFind = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.PropFind,
      callback,
    );
  };
};

export const PropPatch = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.PropPatch,
      callback,
    );
  };
};

export const Put = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Put,
      callback,
    );
  };
};

export const Search = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Search,
      callback,
    );
  };
};

export const Trace = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Trace,
      callback,
    );
  };
};

export const Unlock = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = resolveRouteAction(target, propertyKey);

    router.addRoute(
      resolveUrl(url, target.constructor as Constructor),
      HttpMethod.Unlock,
      callback,
    );
  };
};
