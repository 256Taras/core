import { ClassDecorator } from '../../utils/types/class-decorator.type';

export const Service = (): ClassDecorator<any> => {
  return (target: any) => {
    return target;
  };
};
