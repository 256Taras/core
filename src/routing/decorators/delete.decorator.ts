import { Request, Response } from 'express';
import { Router } from '../router.class';

namespace Route {
  export const Delete = (url: string): (target: any, controllerMethod: string) => void => {
    return (target: any, controllerMethod: string) => {
      Router.delete(url, async (_request: Request, response: Response) => {
        response.send(Router.resolveController(target.constructor, controllerMethod));
      });
    };
  };
}
