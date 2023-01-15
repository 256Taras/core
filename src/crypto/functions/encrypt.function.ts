import { inject } from '../../injector/functions/inject.function';
import { Encrypter } from '../encrypter.class';
import { EncryptionAlgorithm } from '../types/encryption-algorithm.type';

export function encrypt(
  rawData: string,
  algorithm: EncryptionAlgorithm = 'aes-256-ctr',
) {
  return inject(Encrypter).encrypt(rawData, algorithm);
}
