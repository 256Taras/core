import { Reflection as Reflect } from '@abraham/reflection';
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

  public static has(target: Constructor): boolean {
    return this.cachedInstances.has(target);
  }

  public static resolve<T>(target: Constructor<T>, newInstance = false): T | never {
    if (!newInstance && this.has(target)) {
      return this.cachedInstances.get(target);
    }

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
      throw new Error('Injected service type cannot be primitive or predefined');
    }

    const deps: Constructor[] =
      Reflect.getMetadata('design:paramtypes', target) ?? [];

    const resolved = deps.map((param: Constructor) => this.resolve(param));

    const instance = new target(...resolved);

    this.cachedInstances.set(target, instance);

    return instance;
  }
}
