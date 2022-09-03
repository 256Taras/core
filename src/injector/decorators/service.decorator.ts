import { ClassDecorator } from '../../utils/types/class-decorator.type';
import { Constructor } from '../../utils/interfaces/constructor.interface';

export const Service = (): ClassDecorator => {
  return (target: Constructor) => {
    return target;
  };
};
