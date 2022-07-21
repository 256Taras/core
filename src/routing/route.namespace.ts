import { Router } from './router.class';
import { Request, Response } from 'express';

export namespace Route {
  export const Delete = (
    url: string,
  ): ((target: any, controllerMethod: string) => void) => {
    return (target: any, controllerMethod: string) => {
      Router.delete(url, async (_request: Request, response: Response) => {
        response.send(
          Router.resolveController(target.constructor, controllerMethod),
        );
      });
    };
  };

  export const Get = (
    url: string,
  ): ((target: any, controllerMethod: string) => void) => {
    return (target: any, controllerMethod: string) => {
      Router.get(url, async (_request: Request, response: Response) => {
        response.send(
          Router.resolveController(target.constructor, controllerMethod),
        );
      });
    };
  };

  export const Options = (
    url: string,
  ): ((target: any, controllerMethod: string) => void) => {
    return (target: any, controllerMethod: string) => {
      Router.options(url, async (_request: Request, response: Response) => {
        response.send(
          Router.resolveController(target.constructor, controllerMethod),
        );
      });
    };
  };

  export const Patch = (
    url: string,
  ): ((target: any, controllerMethod: string) => void) => {
    return (target: any, controllerMethod: string) => {
      Router.patch(url, async (_request: Request, response: Response) => {
        response.send(
          Router.resolveController(target.constructor, controllerMethod),
        );
      });
    };
  };

  export const Post = (
    url: string,
  ): ((target: any, controllerMethod: string) => void) => {
    return (target: any, controllerMethod: string) => {
      Router.post(url, async (_request: Request, response: Response) => {
        response.send(
          Router.resolveController(target.constructor, controllerMethod),
        );
      });
    };
  };

  export const Put = (
    url: string,
  ): ((target: any, controllerMethod: string) => void) => {
    return (target: any, controllerMethod: string) => {
      Router.put(url, async (_request: Request, response: Response) => {
        response.send(
          Router.resolveController(target.constructor, controllerMethod),
        );
      });
    };
  };
}
