import { inject } from '../../injector/functions/inject.function.js';
import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { MethodDecorator } from '../../utils/types/method-decorator.type.js';
import { Scheduler } from '../scheduler.service.js';

export function Schedule(pattern: string): MethodDecorator {
  return (originalMethod, context) => {
    const scheduler = inject(Scheduler);

    const callback = () => {
      inject(originalMethod.constructor as Constructor)[context.name]();
    };

    scheduler.schedule(pattern, callback);
  };
}
