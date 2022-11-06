import { Reflection as Reflect } from '@abraham/reflection';
import { Constructor } from '../../utils/interfaces/constructor.interface';
import { MethodDecorator } from '../../utils/types/method-decorator.type';

export const Middleware = (middleware: Constructor): MethodDecorator => {
  return (target) => {
    Reflect.defineMetadata('middleware', middleware, target);
  };
};
