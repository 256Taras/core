import { inject } from '../injector/functions/inject.function';
import { MethodDecorator, MethodTarget } from '../utils/types/method-decorator.type';
import { Router } from './router.class';

export class Route {
  private static router = inject(Router);

  public static delete(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      this.router.delete(url, async () => {
        this.router.respond(target.constructor, propertyKey);
      });
    };
  }

  public static get(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      this.router.get(url, async () => {
        this.router.respond(target.constructor, propertyKey);
      });
    };
  }

  public static options(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      this.router.options(url, async () => {
        this.router.respond(target.constructor, propertyKey);
      });
    };
  }

  public static patch(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      this.router.patch(url, async () => {
        this.router.respond(target.constructor, propertyKey);
      });
    };
  }

  public static post(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      this.router.post(url, async () => {
        this.router.respond(target.constructor, propertyKey);
      });
    };
  }

  public static put(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      this.router.put(url, async () => {
        this.router.respond(target.constructor, propertyKey);
      });
    };
  }
}
