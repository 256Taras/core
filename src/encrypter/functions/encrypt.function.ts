import { inject } from '../../injector/functions/inject.function.js';
import { Encrypter } from '../encrypter.service.js';
import { EncryptionAlgorithm } from '../types/encryption-algorithm.type.js';

export function encrypt(
  rawData: string,
  algorithm: EncryptionAlgorithm = 'aes-256-ctr',
) {
  return inject(Encrypter).encrypt(rawData, algorithm);
}
