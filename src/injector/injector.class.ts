import { Exception } from '../handler/exception.class';
import { Constructor } from '../utils/interfaces/constructor.interface';

export class Injector {
  private static cachedInstances: Map<Constructor, any> = new Map();

  public static bind(targets: Constructor | Constructor[]): void {
    if (Array.isArray(targets)) {
      targets.map((target) => {
        const instance = this.resolve<Constructor>(target);

        this.cachedInstances.set(target, instance);
      });

      return;
    }

    const instance = this.resolve<Constructor>(targets);

    this.cachedInstances.set(targets, instance);
  }

  public static get<T = any>(className: Constructor<T>): T {
    return this.cachedInstances.get(className);
  }

  public static has(className: Constructor): boolean {
    return this.cachedInstances.has(className);
  }

  public static resolve<T>(target: Constructor<T>): T | never {
    if (
      [String, Number, Boolean, RegExp, Symbol].includes(
        target as unknown as
          | SymbolConstructor
          | StringConstructor
          | NumberConstructor
          | BooleanConstructor
          | RegExpConstructor,
      )
    ) {
      throw new Exception('Injector target cannot be of primitive type');
    }

    const deps = Reflect.getMetadata('design:paramtypes', target) ?? [];
    const resolved = deps.map((param: Constructor) => this.resolve(param));

    if (this.has(target)) {
      return this.get(target);
    }

    const instance = new target(...resolved);

    this.cachedInstances.set(target, instance);

    return instance;
  }
}
