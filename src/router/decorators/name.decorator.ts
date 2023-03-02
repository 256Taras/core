import { Reflection as Reflect } from '@abraham/reflection';
import { MethodDecorator } from '../../utils/types/method-decorator.type.js';

export function Name(name: string): MethodDecorator {
  return (originalClass) => {
    Reflect.defineMetadata('name', name, originalClass);

    return originalClass;
  };
}
