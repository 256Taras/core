import { MethodDecorator } from '../utils/types/method-decorator.type';
import { Router } from './router.class';
import { Request, Response } from 'express';

interface Target extends Object {
  constructor: any;
}

export class Route {
  constructor(private router: Router) {}

  public delete(url: string): MethodDecorator {
    return (target: Target, propertyKey: string | symbol) => {
      this.router.delete(url, async (request: Request, response: Response) => {
        this.router.respond(request, response, target.constructor, propertyKey);
      });
    };
  }

  public get(url: string): MethodDecorator {
    return (target: Target, propertyKey: string | symbol) => {
      this.router.get(url, async (request: Request, response: Response) => {
        this.router.respond(request, response, target.constructor, propertyKey);
      });
    };
  }

  public options(url: string): MethodDecorator {
    return (target: Target, propertyKey: string | symbol) => {
      this.router.options(url, async (request: Request, response: Response) => {
        this.router.respond(request, response, target.constructor, propertyKey);
      });
    };
  }

  public patch(url: string): MethodDecorator {
    return (target: Target, propertyKey: string | symbol) => {
      this.router.patch(url, async (request: Request, response: Response) => {
        this.router.respond(request, response, target.constructor, propertyKey);
      });
    };
  }

  public post(url: string): MethodDecorator {
    return (target: Target, propertyKey: string | symbol) => {
      this.router.post(url, async (request: Request, response: Response) => {
        this.router.respond(request, response, target.constructor, propertyKey);
      });
    };
  }

  public put(url: string): MethodDecorator {
    return (target: Target, propertyKey: string | symbol) => {
      this.router.put(url, async (request: Request, response: Response) => {
        this.router.respond(request, response, target.constructor, propertyKey);
      });
    };
  }
}
