import { Constructor } from '../../utils/interfaces/constructor.interface';
import { ClassDecorator } from '../../utils/types/class-decorator.type';

export const Service = (): ClassDecorator => {
  return (target: Constructor) => {
    return target;
  };
};
