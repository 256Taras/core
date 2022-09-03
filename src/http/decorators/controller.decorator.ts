import { Reflection as Reflect } from '@abraham/reflection';
import { ClassDecorator } from '../../utils/types/class-decorator.type';
import { Constructor } from '../../utils/interfaces/constructor.interface';

export const Controller = (baseUrl?: string): ClassDecorator => {
  return (target: Constructor) => {
    Reflect.defineMetadata('baseUrl', baseUrl, target);

    return target;
  };
};
