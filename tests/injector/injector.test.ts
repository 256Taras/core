import { describe, expect, it } from 'vitest';
import { Encrypter } from '../../src/encrypter/encrypter.service.js';
import { inject } from '../../src/injector/functions/inject.function.js';
import { Injector } from '../../src/injector/injector.service.js';
import { Logger } from '../../src/logger/logger.service.js';

describe('Injector service', () => {
  it('properly binds services', () => {
    Injector.bind(Logger);
    Injector.bind([Encrypter]);

    const instance = inject(Logger);

    expect(instance).toEqual(expect.any(Logger));
    expect(Injector.resolve(Logger)).toEqual(expect.any(Logger));
    expect(Injector.has(Logger)).toBe(true);
  });
});
