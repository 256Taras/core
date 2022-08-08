import { Injector } from '../injector/injector.class';
import { Router } from './router.class';
import { Request, Response } from 'express';

export namespace Route {
  const router = Injector.resolve(Router);

  export const Delete = (
    url: string,
  ): ((target: any, controllerMethod: string) => void) => {
    return (target: any, controllerMethod: string) => {
      router.delete(url, async (request: Request, response: Response) => {
        router.respond(request, response, target.constructor, controllerMethod);
      });
    };
  };

  export const Get = (
    url: string,
  ): ((target: any, controllerMethod: string) => void) => {
    return (target: any, controllerMethod: string) => {
      router.get(url, async (request: Request, response: Response) => {
        router.respond(request, response, target.constructor, controllerMethod);
      });
    };
  };

  export const Options = (
    url: string,
  ): ((target: any, controllerMethod: string) => void) => {
    return (target: any, controllerMethod: string) => {
      router.options(url, async (request: Request, response: Response) => {
        router.respond(request, response, target.constructor, controllerMethod);
      });
    };
  };

  export const Patch = (
    url: string,
  ): ((target: any, controllerMethod: string) => void) => {
    return (target: any, controllerMethod: string) => {
      router.patch(url, async (request: Request, response: Response) => {
        router.respond(request, response, target.constructor, controllerMethod);
      });
    };
  };

  export const Post = (
    url: string,
  ): ((target: any, controllerMethod: string) => void) => {
    return (target: any, controllerMethod: string) => {
      router.post(url, async (request: Request, response: Response) => {
        router.respond(request, response, target.constructor, controllerMethod);
      });
    };
  };

  export const Put = (
    url: string,
  ): ((target: any, controllerMethod: string) => void) => {
    return (target: any, controllerMethod: string) => {
      router.put(url, async (request: Request, response: Response) => {
        router.respond(request, response, target.constructor, controllerMethod);
      });
    };
  };
}
