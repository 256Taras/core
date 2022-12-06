import { pathToRegexp } from 'path-to-regexp';
import { ClassDecorator } from '../../utils/types/class-decorator.type';

export const Channel = (name: string): ClassDecorator => {
  const pattern = pathToRegexp(name);

  return (target) => {
    return class extends target {
      public readonly namePattern: RegExp = pattern;
    };
  };
};
