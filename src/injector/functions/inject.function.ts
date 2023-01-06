import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Injector } from '../injector.class';
import { ResolveOptions } from '../interfaces/resolve-options.interface';

export function inject<T>(service: Constructor<T>, options?: ResolveOptions): T {
  return Injector.resolve<T>(service, options);
}
