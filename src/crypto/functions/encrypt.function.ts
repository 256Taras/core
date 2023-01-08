import { inject } from '../../injector/functions/inject.function';
import { Encrypter } from '../encrypter.class';

export function encrypt(rawData: string) {
  return inject(Encrypter).encrypt(rawData);
}
