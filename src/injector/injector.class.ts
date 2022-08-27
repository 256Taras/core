import { Exception } from '../handler/exception.class';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Reflection as Reflect } from '@abraham/reflection';

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

  public static get<T = any>(target: Constructor<T>): T {
    if (!this.has(target)) {
      throw new Exception(
        `Service '${target.constructor.name}' does have not a registered instance`,
      );
    }

    return this.cachedInstances.get(target);
  }

  public static has(target: Constructor): boolean {
    return this.cachedInstances.has(target);
  }

  public static resolve<T>(target: Constructor<T>): T | never {
    if (
      [String, Number, Boolean, Symbol, RegExp].includes(
        target as unknown as
          | StringConstructor
          | NumberConstructor
          | BooleanConstructor
          | SymbolConstructor,
      ) ||
      ['null', 'undefined'].includes(typeof target)
    ) {
      throw new Exception('Injected service type cannot be primitive or predefined');
    }

    const deps: Constructor[] = Reflect.getMetadata('design:paramtypes', target) ?? [];
    const resolved = deps.map((param: Constructor) => this.resolve(param));

    if (this.has(target)) {
      return this.get(target);
    }

    const instance = new target(...resolved);

    this.cachedInstances.set(target, instance);

    return instance;
  }
}
