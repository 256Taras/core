import { inject } from '../../injector/functions/inject.function';
import { Constructor } from '../../utils/interfaces/constructor.interface';
import { MethodDecorator } from '../../utils/types/method-decorator.type';
import { Scheduler } from '../scheduler.class';

export function Schedule(pattern: string): MethodDecorator {
  return (target, propertyKey) => {
    const scheduler = inject(Scheduler);

    const callback = () => {
      inject(target.constructor as Constructor)[propertyKey]();
    };

    scheduler.schedule(pattern, callback);
  };
}
