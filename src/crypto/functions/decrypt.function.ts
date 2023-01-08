import { inject } from '../../injector/functions/inject.function';
import { Encrypter } from '../encrypter.class';

export function decrypt(rawData: string) {
  return inject(Encrypter).decrypt(rawData);
}
