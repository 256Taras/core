import { HttpMethod } from '../../http/enums/http-method.enum';
import { inject } from '../../injector/functions/inject.function';
import {
  MethodDecorator,
  MethodTarget,
} from '../../utils/types/method-decorator.type';
import { Router } from '../router.class';

export class Route {
  private static router = inject(Router);

  public static any(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Copy, callback);
      this.router.addRoute(url, HttpMethod.Delete, callback);
      this.router.addRoute(url, HttpMethod.Get, callback);
      this.router.addRoute(url, HttpMethod.Head, callback);
      this.router.addRoute(url, HttpMethod.Lock, callback);
      this.router.addRoute(url, HttpMethod.MkCol, callback);
      this.router.addRoute(url, HttpMethod.Move, callback);
      this.router.addRoute(url, HttpMethod.Options, callback);
      this.router.addRoute(url, HttpMethod.Patch, callback);
      this.router.addRoute(url, HttpMethod.Post, callback);
      this.router.addRoute(url, HttpMethod.PropFind, callback);
      this.router.addRoute(url, HttpMethod.PropPatch, callback);
      this.router.addRoute(url, HttpMethod.Put, callback);
      this.router.addRoute(url, HttpMethod.Search, callback);
      this.router.addRoute(url, HttpMethod.Trace, callback);
      this.router.addRoute(url, HttpMethod.Unlock, callback);
    };
  }

  public static methods(methods: HttpMethod[], url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      methods.map((method) => {
        this.router.addRoute(url, method, callback);
      });
    };
  }

  public static copy(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Copy, callback);
    };
  }

  public static delete(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Delete, callback);
    };
  }

  public static get(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Get, callback);
    };
  }

  public static head(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Head, callback);
    };
  }

  public static lock(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Lock, callback);
    };
  }

  public static mkCol(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.MkCol, callback);
    };
  }

  public static move(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Move, callback);
    };
  }

  public static options(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Options, callback);
    };
  }

  public static patch(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Patch, callback);
    };
  }

  public static post(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Post, callback);
    };
  }

  public static propFind(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.PropFind, callback);
    };
  }

  public static propPatch(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.PropPatch, callback);
    };
  }

  public static put(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Put, callback);
    };
  }

  public static search(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Search, callback);
    };
  }

  public static trace(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Trace, callback);
    };
  }

  public static unlock(url: string): MethodDecorator {
    return (target: MethodTarget, propertyKey: string | symbol) => {
      const callback = async () => {
        await this.router.respond(target.constructor, propertyKey);
      };

      this.router.addRoute(url, HttpMethod.Unlock, callback);
    };
  }
}
