import { HttpMethod } from '../../http/enums/http-method.enum';
import { inject } from '../../injector/functions/inject.function';
import { MethodDecorator } from '../../utils/types/method-decorator.type';
import { Router } from '../router.class';

const router = inject(Router);

export const Any = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    for (const method of Object.values(HttpMethod)) {
      router.addRoute(url, method, callback);
    }
  };
};

export const Methods = (methods: HttpMethod[], url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    methods.map((method) => {
      router.addRoute(url, method, callback);
    });
  };
};

export const Copy = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Copy, callback);
  };
};

export const Delete = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Delete, callback);
  };
};

export const Get = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Get, callback);
  };
};

export const Head = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Head, callback);
  };
};

export const Lock = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Lock, callback);
  };
};

export const Mkcol = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Mkcol, callback);
  };
};

export const Move = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Move, callback);
  };
};

export const Options = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Options, callback);
  };
};

export const Patch = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Patch, callback);
  };
};

export const Post = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Post, callback);
  };
};

export const PropFind = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.PropFind, callback);
  };
};

export const PropPatch = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.PropPatch, callback);
  };
};

export const Put = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Put, callback);
  };
};

export const Search = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Search, callback);
  };
};

export const Trace = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Trace, callback);
  };
};

export const Unlock = (url: string): MethodDecorator => {
  return (target, propertyKey) => {
    const callback = async () => {
      await router.respond(target.constructor, propertyKey);
    };

    router.addRoute(url, HttpMethod.Unlock, callback);
  };
};
