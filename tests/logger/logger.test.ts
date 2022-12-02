import { describe, expect, it } from 'vitest';
import { inject } from '../../src/injector/functions/inject.function';
import { Logger } from '../../src/logger/logger.class';

describe('Logger class', () => {
  const logger = inject(Logger);

  logger.$disable();

  it('exposes public property', () => {
    expect(logger.colorOrange).toBe('#ffa57c');
    expect(logger.colorRed).toBe('#f87777');
    expect(logger.colorYellow).toBe('#f8c377');
  });
});
