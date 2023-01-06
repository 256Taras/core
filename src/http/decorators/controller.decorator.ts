import { Reflection as Reflect } from '@abraham/reflection';
import { ClassDecorator } from '../../utils/types/class-decorator.type';

export function Controller(baseUrl?: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata('baseUrl', baseUrl, target);

    return target;
  };
}
