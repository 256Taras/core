import { Router } from '../router.class';

export namespace Route {
  export const Get = (url: string): (target: any, controllerMethod: string) => void => {
    return (target: any, controllerMethod: string) => {
      Router.get(url, async () => Router.resolveController(target.constructor, controllerMethod));
    };
  };
}
