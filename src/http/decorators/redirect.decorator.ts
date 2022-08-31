import { Reflection as Reflect } from '@abraham/reflection';
import { MethodDecorator } from '../../utils/types/method-decorator.type';
import { StatusCode } from '../enums/status-code.enum';

export const Redirect = (
  url: string,
  status: StatusCode = StatusCode.Found,
): MethodDecorator => {
  return (target) => {
    Reflect.defineMetadata('redirectUrl', url, target);
    Reflect.defineMetadata('redirectStatus', status, target);
  };
};
