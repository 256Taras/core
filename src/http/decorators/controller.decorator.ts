import { ClassDecorator } from '../../utils/types/class-decorator.type';
import { Reflection as Reflect } from '@abraham/reflection';

export const Controller = (baseUrl?: string): ClassDecorator<any> => {
  return (target: any) => {
    Reflect.defineMetadata('baseUrl', baseUrl, target);

    return target;
  };
};
