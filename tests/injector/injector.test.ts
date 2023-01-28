import { describe, expect, it } from 'vitest';
import { Encrypter } from '../../src/crypto/encrypter.class.js';
import { inject } from '../../src/injector/functions/inject.function.js';
import { Injector } from '../../src/injector/injector.class.js';
import { Logger } from '../../src/logger/logger.class.js';

describe('Injector class', () => {
  it('properly binds services', () => {
    Injector.bind(Logger);
    Injector.bind([Encrypter]);

    const instance = inject(Logger);

    expect(instance).toEqual(expect.any(Logger));
    expect(Injector.resolve(Logger)).toEqual(expect.any(Logger));
    expect(Injector.has(Logger)).toBe(true);
  });
});
