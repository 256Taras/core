import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { ClassDecorator } from '../../utils/types/class-decorator.type.js';

export function Service(): ClassDecorator {
  return (target: Constructor) => {
    return target;
  };
}
