import { describe, expect, it } from 'vitest';
import { Encrypter } from '../../src/crypto/encrypter.class';
import { inject } from '../../src/injector/functions/inject.function';

describe('Encrypter class', () => {
  const encrypter = inject(Encrypter);

  const data = 'test';

  it('correctly encrypts data', async () => {
    const encryptedData = await encrypter.encrypt(data);
    const decryptedData = await encrypter.decrypt(encryptedData);

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
