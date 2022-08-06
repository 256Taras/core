import { ClassDecorator } from '../../utils/types/class-decorator.type';

export const Controller = (baseUrl?: string): ClassDecorator<any> => {
  return (target: any) => {
    Reflect.defineMetadata('baseUrl', baseUrl, target);

    return target;
  };
};
