import { ClassDecorator } from '../../utils/types/class-decorator.type';

export const Service = (): ClassDecorator => {
  return (target: any) => {
    return target;
  };
};
