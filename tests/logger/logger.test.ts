import { describe, expect, it } from 'vitest';
import { inject } from '../../src/injector/functions/inject.function.js';
import {
  LOGGER_COLOR_GREEN,
  LOGGER_COLOR_ORANGE,
  LOGGER_COLOR_RED,
  LOGGER_COLOR_YELLOW,
} from '../../src/logger/constants';
import { Logger } from '../../src/logger/logger.service.js';

describe('Logger service', () => {
  const logger = inject(Logger);

  logger.$disable();

  it('exposes constants', () => {
    expect(LOGGER_COLOR_ORANGE).toBe('#ffa57c');
    expect(LOGGER_COLOR_GREEN).toBe('#0dbc79');
    expect(LOGGER_COLOR_RED).toBe('#f87777');
    expect(LOGGER_COLOR_YELLOW).toBe('#f8c377');
  });
});
