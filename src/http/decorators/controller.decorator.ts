import { ClassDecorator } from '../../utils/types/class-decorator.type';

export const Controller = (baseUrl?: string): ClassDecorator<any> => {
  return (target: any) => {
    return class extends target {
      public baseUrl = baseUrl;
    };
  };
};
