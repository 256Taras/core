import { Reflection as Reflect } from '@abraham/reflection';
import { MethodDecorator } from '../../utils/types/method-decorator.type.js';
import { StatusCode } from '../enums/status-code.enum.js';

export function Status(status: StatusCode = StatusCode.Ok): MethodDecorator {
  return (originalClass) => {
    Reflect.defineMetadata('statusCode', status, originalClass);

    return originalClass;
  };
}
