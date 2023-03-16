import { describe, expect, it } from 'vitest';
import { Encrypter } from '../../src/encrypter/encrypter.service.js';
import { inject } from '../../src/injector/functions/inject.function.js';

describe('Encrypter class', () => {
  const encrypter = inject(Encrypter);

  const data = 'test';

  it('correctly encrypts data', async () => {
    const encryptedData = encrypter.encrypt(data);
    const decryptedData = encrypter.decrypt(encryptedData);

    expect(decryptedData).toBe(data);
  });

  it('correctly hashes data', async () => {
    const hash = await encrypter.hash(data);
    const equal = await encrypter.compareHash(data, hash);

    expect(equal).toBe(true);
  });

  it('generates random UUID', async () => {
    const uuid = encrypter.uuid();

    expect(typeof uuid).toBe('string');
  });
});
