import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { Injector } from '../injector.service.js';
import { ResolveOptions } from '../interfaces/resolve-options.interface.js';

export function inject<T>(service: Constructor<T>, options?: ResolveOptions): T {
  return Injector.resolve<T>(service, options);
}
