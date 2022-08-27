import { Constructor } from '../../utils/interfaces/constructor.interface';
import { ClassDecorator } from '../../utils/types/class-decorator.type';

interface Data {
  signature: string;
  parameters?: {
    type: string;
    short?: string;
    multiple?: boolean;
  };
}

export const Command = (data: Data): ClassDecorator<any> => {
  return (target: Constructor) => {
    const { signature, parameters } = data;

    Reflect.defineMetadata('signature', signature, target);
    Reflect.defineMetadata('parameters', parameters, target);

    return target;
  };
};
