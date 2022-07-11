import { ClassDecorator } from '../../utils/types/class-decorator.type';
import { Constructor } from '../../utils/interfaces/constructor.interface';

export const Controller = (baseUrl?: string): ClassDecorator<Constructor> => {
  return (target: any) => {
    return class extends target {
      public baseUrl = baseUrl;
    };
  };
};
