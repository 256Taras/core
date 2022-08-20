import 'reflect-metadata';
import { Injector } from '../../src/injector/injector.class';
import { Logger } from '../../src/logger/logger.class';
import { Encrypter } from '../../src/crypto/encrypter.class';
import { describe, expect, it } from 'vitest';

describe('Injector class', () => {
  it('properly binds services', () => {
    Injector.bind(Logger);
    Injector.bind([Encrypter]);

    let instance: Logger | null;

    try {
      instance = Injector.get(Logger);
    } catch (error) {
      instance = null;
    }

    expect(instance).toEqual(expect.any(Logger));
    expect(Injector.resolve(Logger)).toEqual(expect.any(Logger));
    expect(Injector.has(Logger)).toBe(true);
  });
});
