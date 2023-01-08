import { inject } from '../../injector/functions/inject.function';
import { ParameterDecorator } from '../../utils/types/parameter-decorator.type';
import { Encrypter } from '../encrypter.class';

export function EncryptedParam(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const encrypter = inject(Encrypter);

    if (target[propertyKey]) {
      target[propertyKey] = (...args: unknown[]) => {
        args[parameterIndex] = encrypter.decrypt(String(propertyKey));

        return (args[parameterIndex] as Function)(...args);
      };
    }
  };
}
