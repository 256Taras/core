import { describe, expect, it } from 'vitest';
import { inject } from '../../src/injector/functions/inject.function.js';
import { Logger } from '../../src/logger/logger.service.js';

describe('inject function', () => {
  it('returns correctly injected instance', () => {
    const instance = inject(Logger);

    expect(instance).toEqual(expect.any(Logger));
  });
});
