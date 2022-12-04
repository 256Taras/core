import { Reflection as Reflect } from '@abraham/reflection';
import { pathToRegexp } from 'path-to-regexp';
import { ClassDecorator } from '../../utils/types/class-decorator.type';

export const Channel = (name: string): ClassDecorator => {
  return (target) => {
    const pattern = pathToRegexp(name);

    Reflect.defineMetadata('namePattern', pattern, target);

    return target;
  };
};
