import { env } from '../../src/utils/functions/env.function';
import { describe, expect, it } from 'vitest';

describe('env function', () => {
  it('returns valid .env entries', () => {
    const isDebug = env<boolean>('APP_DEBUG');

    expect(isDebug).toEqual(null);
  });
});
