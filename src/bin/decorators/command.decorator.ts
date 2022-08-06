import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { ClassDecorator } from '../../utils/types/class-decorator.type.js';

interface Data {
  signature: string;
  parameters?: string[];
}

export const Command = (data: Data): ClassDecorator<any> => {
  return (target: Constructor) => {
    const { signature, parameters } = data;

    Reflect.defineMetadata('signature', signature, target);
    Reflect.defineMetadata('parameters', parameters, target);

    return target;
  };
};
