import { beforeEach, describe, expect, it } from 'vitest';
import { inject } from '../../src/injector/functions/inject.function';
import { Logger } from '../../src/logger/logger.class';

describe('Logger class', () => {
  let instance;

  beforeEach(() => {
    instance = inject(Logger);
  });

  it('exposes public property', () => {
    expect(instance.colorYellow).toBe('#f8c377');
  });

  it('exposes log methods', () => {
    expect(instance.error('test')).toBe(undefined);
    expect(instance.info('test')).toBe(undefined);
    expect(instance.log('test')).toBe(undefined);
    expect(instance.warn('test')).toBe(undefined);
  });
});
