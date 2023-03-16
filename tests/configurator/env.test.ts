import { describe, expect, it } from 'vitest';
import { env } from '../../src/configurator/functions/env.function.js';

describe('env function', () => {
  it('returns valid .env entries', () => {
    const isDebug = env<boolean>('DEVELOPMENT');

    expect(isDebug).toBe(null);
  });
});
