import { inject } from '../../injector/functions/inject.function.js';
import { Encrypter } from '../encrypter.service.js';

export function useCrypto(): [
  (rawData: string) => string,
  (encryptedData: string) => string,
  (data: string, saltRounds?: number) => Promise<string>,
  (data: string, hash: string) => Promise<boolean>,
] {
  const instance = inject(Encrypter);

  return [instance.encrypt, instance.decrypt, instance.hash, instance.compareHash];
}
