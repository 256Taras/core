import { Reflection as Reflect } from '@abraham/reflection';
import { Constructor } from '../../utils/interfaces/constructor.interface';
import { ClassDecorator } from '../../utils/types/class-decorator.type';
import { ModuleData } from '../interfaces/module-data.interface';

export const Module = (data?: ModuleData): ClassDecorator => {
  return (target: Constructor) => {
    Reflect.defineMetadata('controllers', data?.controllers ?? [], target);
    Reflect.defineMetadata('socketChannels', data?.socketChannels ?? [], target);

    return target;
  };
};
