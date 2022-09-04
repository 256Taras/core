import { describe, expect, it } from 'vitest';
import { env } from '../../src/utils/functions/env.function';

describe('env function', () => {
  it('returns valid .env entries', () => {
    const isDebug = env<boolean>('NORTHER_DEV');

    expect(isDebug).toBe(null);
  });
});
