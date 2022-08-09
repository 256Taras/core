import { inject } from '../injector/functions/inject.function';
import { MethodDecorator } from '../utils/types/method-decorator.type';
import { Router } from './router.class';
import { Request, Response } from 'express';

interface Target extends Object {
  constructor: any;
}

export namespace Route {
  const router = inject(Router);

  export const Delete = (url: string): MethodDecorator => {
    return (target: Target, propertyKey: string | symbol) => {
      router.delete(url, async (request: Request, response: Response) => {
        router.respond(request, response, target.constructor, propertyKey);
      });
    };
  };

  export const Get = (url: string): MethodDecorator => {
    return (target: Target, propertyKey: string | symbol) => {
      router.get(url, async (request: Request, response: Response) => {
        router.respond(request, response, target.constructor, propertyKey);
      });
    };
  };

  export const Options = (url: string): MethodDecorator => {
    return (target: Target, propertyKey: string | symbol) => {
      router.options(url, async (request: Request, response: Response) => {
        router.respond(request, response, target.constructor, propertyKey);
      });
    };
  };

  export const Patch = (url: string): MethodDecorator => {
    return (target: Target, propertyKey: string | symbol) => {
      router.patch(url, async (request: Request, response: Response) => {
        router.respond(request, response, target.constructor, propertyKey);
      });
    };
  };

  export const Post = (url: string): MethodDecorator => {
    return (target: Target, propertyKey: string | symbol) => {
      router.post(url, async (request: Request, response: Response) => {
        router.respond(request, response, target.constructor, propertyKey);
      });
    };
  };

  export const Put = (url: string): MethodDecorator => {
    return (target: Target, propertyKey: string | symbol) => {
      router.put(url, async (request: Request, response: Response) => {
        router.respond(request, response, target.constructor, propertyKey);
      });
    };
  };
}
