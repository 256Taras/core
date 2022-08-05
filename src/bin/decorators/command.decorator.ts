import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { ClassDecorator } from '../../utils/types/class-decorator.type.js';

interface Data {
  signature: string;
  parameters?: string[];
}

export const Command = (data: Data): ClassDecorator<any> => {
  return (target: Constructor) => {
    return class extends target {
      public readonly signature = data.signature;

      public readonly parameters = data.parameters ?? [];
    };
  };
};
