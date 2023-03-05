import { Reflection as Reflect } from '@abraham/reflection';
import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { ClassDecorator } from '../../utils/types/class-decorator.type.js';
import { CommandOptions } from '../interfaces/command-options.interface.js';

export function Command(options: CommandOptions): ClassDecorator {
  return (originalClass: Constructor) => {
    const { signature, signatures, parameters } = options;

    Reflect.defineMetadata('parameters', parameters, originalClass);
    Reflect.defineMetadata('signature', signature, originalClass);
    Reflect.defineMetadata('signatures', signatures, originalClass);

    return originalClass;
  };
}
