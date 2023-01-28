import { Reflection as Reflect } from '@abraham/reflection';
import { Integer } from '../../utils/types/integer.type.js';
import { ParameterDecorator } from '../../utils/types/parameter-decorator.type.js';
import { EncryptionAlgorithm } from '../types/encryption-algorithm.type.js';

export function EncryptedParam(
  algorithm: EncryptionAlgorithm = 'aes-256-cbc',
): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    Reflect.defineMetadata(
      'encryptedParams',
      {
        algorithm,
        indexes: [
          ...(Reflect.getMetadata<{
            algorithm: EncryptionAlgorithm;
            indexes: Integer[];
          }>('encryptedParams', target[propertyKey])?.indexes || []),
          parameterIndex,
        ],
      },
      target[propertyKey],
    );

    return target;
  };
}
