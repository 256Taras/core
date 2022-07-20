import { Constructor } from '../utils/interfaces/constructor.interface';
import 'reflect-metadata';

export class Injector {
  private static singletons: Map<Constructor, any> = new Map();

  public static bindSingletons(classes: Constructor[]): void {
    classes.map((className) => {
      const instance = new className();

      this.singletons.set(className, instance);
    });
  }

  public static getSingleton<T = any>(className: Constructor<T>): T {
    return this.singletons.get(className);
  }

  public static hasSingleton(className: Constructor): boolean {
    return this.singletons.has(className);
  }

  private static getInstance<T>(target: Constructor<T>, ...deps: Constructor[]): T {
    const instance = this.hasSingleton(target)
      ? this.getSingleton(target)
      : new target(...deps);

    return instance;
  }

  public static resolve<T>(target: Constructor<T>): T {
    const deps = Reflect.getMetadata('design:paramtypes', target) ?? [];
    const resolved = deps.map((param: Constructor) => this.resolve(param));

    return this.getInstance(target, ...resolved);
  }
}
