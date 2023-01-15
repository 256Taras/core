import { inject } from '../../injector/functions/inject.function';
import { Encrypter } from '../encrypter.class';
import { EncryptionAlgorithm } from '../types/encryption-algorithm.type';

export function decrypt(
  encryptedData: string,
  algorithm: EncryptionAlgorithm = 'aes-256-ctr',
) {
  return inject(Encrypter).decrypt(encryptedData, algorithm);
}
