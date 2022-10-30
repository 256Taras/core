import { describe, expect, it } from 'vitest';
import { inject } from '../../src/injector/functions/inject.function';
import { Logger } from '../../src/logger/logger.class';

describe('Logger class', () => {
  const logger = inject(Logger);

  logger.$disable();

  it('exposes public property', () => {
    expect(logger.colorYellow).toBe('#f8c377');
  });

  it('exposes log methods', () => {
    expect(logger.error('test')).toBe(undefined);
    expect(logger.info('test')).toBe(undefined);
    expect(logger.log('test')).toBe(undefined);
    expect(logger.warn('test')).toBe(undefined);
  });
});
