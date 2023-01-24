import { Reflection as Reflect } from '@abraham/reflection';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { ResolveOptions } from './interfaces/resolve-options.interface';

export class Injector {
  private static cachedInstances = new Map<Constructor, unknown>();

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

  public static resolve<T>(
    target: Constructor<T>,
    options?: ResolveOptions,
  ): T | never {
    if (!(options?.freshInstance ?? false) && this.has(target)) {
      return this.cachedInstances.get(target) as T;
    }

    if (
      [String, Number, Boolean, Symbol].includes(
        target as unknown as
          | StringConstructor
          | NumberConstructor
          | BooleanConstructor
          | SymbolConstructor,
      ) ||
      ['null', 'undefined'].includes(typeof target)
    ) {
      throw new Error('Primitive types are not injectable', {
        cause: new Error('Remove primitive types from the constructor'),
      });
    }

    const deps: Constructor[] =
      Reflect.getMetadata('design:paramtypes', target) ?? [];

    const resolved = deps.map((param: Constructor) => this.resolve(param));

    const instance = new target(...resolved);

    this.cachedInstances.set(target, instance);

    return instance;
  }
}
