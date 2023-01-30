import { Reflection as Reflect } from '@abraham/reflection';
import { RouteUrl } from '../../router/types/route-url.type.js';
import { ClassDecorator } from '../../utils/types/class-decorator.type.js';

export function Controller(baseUrl?: RouteUrl): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata('baseUrl', baseUrl, target);

    return target;
  };
}
