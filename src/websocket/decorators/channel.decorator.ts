import { pathToRegexp } from 'path-to-regexp';
import { ClassDecorator } from '../../utils/types/class-decorator.type.js';

export function Channel(name: string, serverName = 'main'): ClassDecorator {
  const pattern = pathToRegexp(name);

  return (target) => {
    return class extends target {
      public readonly namePattern = pattern;

      public readonly serverName = serverName;
    };
  };
}
