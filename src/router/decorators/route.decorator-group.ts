import { inject } from '../../injector/functions/inject.function';
import { MethodDecorator, MethodTarget } from '../../utils/types/method-decorator.type';
import { Router } from '../router.class';

export class Route {
  private static router = inject(Router);

  public static any(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.delete(url, callback);
      this.router.get(url, callback);
      this.router.options(url, callback);
      this.router.patch(url, callback);
      this.router.post(url, callback);
      this.router.put(url, callback);
    };
  }

  public static delete(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      this.router.delete(url, async () => {
        await this.router.respond(target.constructor, propertyKey);
      });
    };
  }

  public static get(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      this.router.get(url, async () => {
        await this.router.respond(target.constructor, propertyKey);
      });
    };
  }

  public static options(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      this.router.options(url, async () => {
        await this.router.respond(target.constructor, propertyKey);
      });
    };
  }

  public static patch(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      this.router.patch(url, async () => {
        await this.router.respond(target.constructor, propertyKey);
      });
    };
  }

  public static post(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      this.router.post(url, async () => {
        await this.router.respond(target.constructor, propertyKey);
      });
    };
  }

  public static put(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      this.router.put(url, async () => {
        await this.router.respond(target.constructor, propertyKey);
      });
    };
  }
}
