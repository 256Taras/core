import { Reflection as Reflect } from '@abraham/reflection';
import { Integer } from '../../utils/types/integer.type';
import { ParameterDecorator } from '../../utils/types/parameter-decorator.type';

export function EncryptedParam(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    Reflect.defineMetadata(
      'encryptedParamIndexes',
      [
        ...(Reflect.getMetadata<Integer[]>(
          'encryptedParamIndexes',
          target[propertyKey],
        ) || []),
        parameterIndex,
      ],
      target[propertyKey],
    );

    return target;
  };
}
