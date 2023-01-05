import { Scheduler } from '../scheduler.class';
import { inject } from '../../injector/functions/inject.function';
import { Constructor } from '../../utils/interfaces/constructor.interface';
import { MethodDecorator } from '../../utils/types/method-decorator.type';
import { Integer } from '../../utils/types/integer.type';

export const Interval = (milliseconds: Integer): MethodDecorator => {
  return (target, propertyKey) => {
    const scheduler = inject(Scheduler);

    const callback = () => {
      inject(target.constructor as Constructor)[propertyKey];
    };

    scheduler.interval(callback, milliseconds);
  };
};
