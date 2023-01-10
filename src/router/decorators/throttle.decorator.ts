import { Reflection as Reflect } from '@abraham/reflection';
import { Integer } from '../../utils/types/integer.type';
import { MethodDecorator } from '../../utils/types/method-decorator.type';

export function Throttle(maxRequestsPerMinute: Integer): MethodDecorator {
  return (target) => {
    Reflect.defineMetadata('maxRequestsPerMinute', maxRequestsPerMinute, target);
  };
}
