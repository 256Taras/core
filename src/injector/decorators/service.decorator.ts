import { Constructor } from '../../utils/interfaces/constructor.interface';
import { ClassDecorator } from '../../utils/types/class-decorator.type';

export function Service(): ClassDecorator {
  return (target: Constructor) => {
    return target;
  };
}
