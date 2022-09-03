import { Reflection as Reflect } from '@abraham/reflection';
import { Constructor } from '../../utils/interfaces/constructor.interface';
import { ClassDecorator } from '../../utils/types/class-decorator.type';

export const Controller = (baseUrl?: string): ClassDecorator => {
  return (target: Constructor) => {
    Reflect.defineMetadata('baseUrl', baseUrl, target);

    return target;
  };
};
