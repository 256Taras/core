import { Reflection as Reflect } from '@abraham/reflection';
import { MethodDecorator } from '../../utils/types/method-decorator.type.js';

export function Name(name: string): MethodDecorator {
  return (target) => {
    Reflect.defineMetadata('name', name, target);
  };
}
