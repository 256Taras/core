import { Reflection as Reflect } from '@abraham/reflection';
import { Integer } from '../../utils/types/integer.type.js';
import { MethodDecorator } from '../../utils/types/method-decorator.type.js';

export function Throttle(maxRequestsPerMinute: Integer): MethodDecorator {
  return (originalClass) => {
    Reflect.defineMetadata(
      'maxRequestsPerMinute',
      maxRequestsPerMinute,
      originalClass,
    );

    return originalClass;
  };
}
