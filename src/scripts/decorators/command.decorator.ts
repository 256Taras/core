import { Reflection as Reflect } from '@abraham/reflection';
import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { ClassDecorator } from '../../utils/types/class-decorator.type.js';
import { Parameter } from '../interfaces/parameter.interface.js';

interface Options {
  signature?: string;
  signatures?: string[];
  parameters?: Record<string, Parameter>;
}

export function Command(options: Options): ClassDecorator {
  return (originalClass: Constructor) => {
    const { signature, signatures, parameters } = options;

    Reflect.defineMetadata('signature', signature, originalClass);
    Reflect.defineMetadata('signatures', signatures, originalClass);
    Reflect.defineMetadata('parameters', parameters, originalClass);

    return originalClass;
  };
}
