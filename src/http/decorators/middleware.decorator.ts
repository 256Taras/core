import { Reflection as Reflect } from '@abraham/reflection';
import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { MethodDecorator } from '../../utils/types/method-decorator.type.js';

export function Middleware(middleware: Constructor): MethodDecorator {
  return (originalClass) => {
    Reflect.defineMetadata('middleware', middleware, originalClass);

    return originalClass;
  };
}
