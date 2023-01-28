import { Reflection as Reflect } from '@abraham/reflection';
import { MethodDecorator } from '../../utils/types/method-decorator.type.js';
import { StatusCode } from '../enums/status-code.enum.js';

export function Status(status: StatusCode = StatusCode.Ok): MethodDecorator {
  return (target) => {
    Reflect.defineMetadata('statusCode', status, target);
  };
}
