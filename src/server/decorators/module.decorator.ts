import { ClassDecorator } from '../../utils/types/class-decorator.type';
import { ModuleData } from '../interfaces/module-data.interface';
import { Reflection as Reflect } from '@abraham/reflection';

export const Module = (data: ModuleData): ClassDecorator<any> => {
  return (target: any) => {
    const { controllers, channels } = data;

    Reflect.defineMetadata('controllers', controllers, target);
    Reflect.defineMetadata('channels', channels, target);

    return target;
  };
};
