import { Reflection as Reflect } from '@abraham/reflection';
import { MethodDecorator } from '../../utils/types/method-decorator.type';
import { Constructor } from '../../utils/interfaces/constructor.interface';

export const Middleware = (middleware: Constructor): MethodDecorator => {
  return (target) => {
    Reflect.defineMetadata('middleware', middleware, target);
  };
};
