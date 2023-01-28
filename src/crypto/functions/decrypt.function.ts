import { inject } from '../../injector/functions/inject.function.js';
import { Encrypter } from '../encrypter.service.js';
import { EncryptionAlgorithm } from '../types/encryption-algorithm.type.js';

export function decrypt(
  encryptedData: string,
  algorithm: EncryptionAlgorithm = 'aes-256-ctr',
) {
  return inject(Encrypter).decrypt(encryptedData, algorithm);
}
