import { inject } from '../../injector/functions/inject.function.js';
import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { Integer } from '../../utils/types/integer.type.js';
import { MethodDecorator } from '../../utils/types/method-decorator.type.js';
import { Scheduler } from '../scheduler.service.js';

export function Timeout(milliseconds: Integer): MethodDecorator {
  return (target, propertyKey) => {
    const scheduler = inject(Scheduler);

    const callback = () => {
      inject(target.constructor as Constructor)[propertyKey]();
    };

    scheduler.timeout(callback, milliseconds);
  };
}
