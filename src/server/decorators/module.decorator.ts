import { Reflection as Reflect } from '@abraham/reflection';
import { ClassDecorator } from '../../utils/types/class-decorator.type';
import { ModuleData } from '../interfaces/module-data.interface';

export const Module = (data?: ModuleData): ClassDecorator<any> => {
  return (target: any) => {
    Reflect.defineMetadata('controllers', data?.controllers ?? [], target);
    Reflect.defineMetadata('channels', data?.channels ?? [], target);

    return target;
  };
};
