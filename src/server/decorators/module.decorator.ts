import { Reflection as Reflect } from '@abraham/reflection';
import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { ClassDecorator } from '../../utils/types/class-decorator.type.js';
import { ModuleData } from '../interfaces/module-data.interface.js';

export function Module(data?: ModuleData): ClassDecorator {
  return (target: Constructor) => {
    Reflect.defineMetadata('controllers', data?.controllers ?? [], target);
    Reflect.defineMetadata('socketChannels', data?.socketChannels ?? [], target);

    return target;
  };
}
