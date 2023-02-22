import { inject } from '../../injector/functions/inject.function.js';
import { Integer } from '../../utils/types/integer.type.js';
import { Encrypter } from '../encrypter.service.js';

export function useCrypto(): [
  (rawData: string) => string,
  (encryptedData: string) => string,
  (data: string, saltRounds?: Integer) => Promise<string>,
  (data: string, hash: string) => Promise<boolean>,
] {
  const instance = inject(Encrypter);

  return [instance.encrypt, instance.decrypt, instance.hash, instance.compareHash];
}
