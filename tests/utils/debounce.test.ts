import { describe, expect, it } from 'vitest';
import { debounce } from '../../src/utils/functions/debounce.function.js';

describe('debounce function', () => {
  it('returns correctly debounced callback', async () => {
    const callback = debounce(() => true);

    expect(callback).toEqual(expect.any(Function));
    expect(await callback()).toBe(true);
  });
});
