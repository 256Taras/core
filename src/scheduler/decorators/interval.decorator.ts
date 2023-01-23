import { inject } from '../../injector/functions/inject.function';
import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Integer } from '../../utils/types/integer.type';
import { MethodDecorator } from '../../utils/types/method-decorator.type';
import { Scheduler } from '../scheduler.service';

export function Interval(milliseconds: Integer): MethodDecorator {
  return (target, propertyKey) => {
    const scheduler = inject(Scheduler);

    const callback = () => {
      inject(target.constructor as Constructor)[propertyKey]();
    };

    scheduler.interval(callback, milliseconds);
  };
}
