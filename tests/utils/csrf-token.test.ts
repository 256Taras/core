import { describe, expect, it } from 'vitest';
import { csrfToken } from '../../src/utils/functions/csrf-token.function';

describe('csrfToken function', () => {
  it('returns CSRF token', async () => {
    const token = await csrfToken();

    expect(typeof token).toBe('string');
  });
});
