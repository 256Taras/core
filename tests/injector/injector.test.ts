import { describe, expect, it } from 'vitest';
import { Encrypter } from '../../src/crypto/encrypter.class';
import { inject } from '../../src/injector/functions/inject.function';
import { Injector } from '../../src/injector/injector.class';
import { Logger } from '../../src/logger/logger.class';

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
