import { inject } from '../injector/functions/inject.function';
import { MethodDecorator } from '../utils/types/method-decorator.type';
import { Router } from './router.class';
import { Request, Response } from 'express';

interface Target extends Object {
  constructor: any;
}

export class Route {
  private static router = inject(Router);

  public static delete(url: string): MethodDecorator {
    return (target: Target, propertyKey: string | symbol) => {
      this.router.delete(url, async (request: Request, response: Response) => {
        this.router.respond(request, response, target.constructor, propertyKey);
      });
    };
  }

  public static get(url: string): MethodDecorator {
    return (target: Target, propertyKey: string | symbol) => {
      this.router.get(url, async (request: Request, response: Response) => {
        this.router.respond(request, response, target.constructor, propertyKey);
      });
    };
  }

  public static options(url: string): MethodDecorator {
    return (target: Target, propertyKey: string | symbol) => {
      this.router.options(url, async (request: Request, response: Response) => {
        this.router.respond(request, response, target.constructor, propertyKey);
      });
    };
  }

  public static patch(url: string): MethodDecorator {
    return (target: Target, propertyKey: string | symbol) => {
      this.router.patch(url, async (request: Request, response: Response) => {
        this.router.respond(request, response, target.constructor, propertyKey);
      });
    };
  }

  public static post(url: string): MethodDecorator {
    return (target: Target, propertyKey: string | symbol) => {
      this.router.post(url, async (request: Request, response: Response) => {
        this.router.respond(request, response, target.constructor, propertyKey);
      });
    };
  }

  public static put(url: string): MethodDecorator {
    return (target: Target, propertyKey: string | symbol) => {
      this.router.put(url, async (request: Request, response: Response) => {
        this.router.respond(request, response, target.constructor, propertyKey);
      });
    };
  }
}
