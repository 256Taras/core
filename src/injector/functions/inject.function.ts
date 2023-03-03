import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { Injector } from '../injector.service.js';
import { ServiceResolveOptions } from '../interfaces/service-resolve-options.interface.js';

export function inject<T>(
  service: Constructor<T>,
  options?: ServiceResolveOptions,
): T {
  return Injector.resolve<T>(service, options);
}
