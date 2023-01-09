import { inject } from '../../injector/functions/inject.function';
import { Encrypter } from '../encrypter.class';

export function decrypt(encryptedData: string) {
  return inject(Encrypter).decrypt(encryptedData);
}
