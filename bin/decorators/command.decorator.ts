import { Reflection as Reflect } from '@abraham/reflection';
import { Constructor } from '../../src/utils/interfaces/constructor.interface';
import { ClassDecorator } from '../../src/utils/types/class-decorator.type';
import { Parameter } from '../interfaces/parameter.interface';

interface Data {
  signature: string;
  parameters?: Record<string, Parameter>;
}

export const Command = (data: Data): ClassDecorator<any> => {
  return (target: Constructor) => {
    const { signature, parameters } = data;

    Reflect.defineMetadata('signature', signature, target);
    Reflect.defineMetadata('parameters', parameters, target);

    return target;
  };
};
