import { Constructor } from '../utils/interfaces/constructor.interface';

export class Injector {
  private static singletons: Map<Constructor, any> = new Map();

  public static bind(targets: Constructor | Constructor[]): void {
    if (Array.isArray(targets)) {
      targets.map((target) => {
        const instance = this.resolve<Constructor>(target);

        this.singletons.set(target, instance);
      });

      return;
    }

    const instance = this.resolve<Constructor>(targets);

    this.singletons.set(targets, instance);
  }

  public static get<T = any>(className: Constructor<T>): T {
    return this.singletons.get(className);
  }

  public static has(className: Constructor): boolean {
    return this.singletons.has(className);
  }

  public static resolve<T>(target: Constructor<T>): T {
    const deps = Reflect.getMetadata('design:paramtypes', target) ?? [];
    const resolved = deps.map((param: Constructor) => this.resolve(param));

    const instance = this.has(target) ? this.get(target) : new target(...resolved);

    return instance;
  }
}
