import { Constructor } from '../utils/interfaces/constructor.interface.js';
import { ServiceResolveOptions } from './interfaces/service-resolve-options.interface.js';

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
    options?: ServiceResolveOptions,
  ): T | never {
    if (!(options?.freshInstance ?? false) && this.has(target)) {
      return this.cachedInstances.get(target) as T;
    }

    const instance = new target();

    this.cachedInstances.set(target, instance);

    return instance;
  }
}
