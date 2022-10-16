import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Injector } from '../injector.class';

export const inject = <T>(service: Constructor<T>, newInstance = false): T => {
  return Injector.resolve<T>(service, newInstance);
};
