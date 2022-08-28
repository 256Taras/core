import { describe, expect, it } from 'vitest';
import { debounce } from '../../src/utils/functions/debounce.function';

describe('debounce function', () => {
  it('returns correctly debounced callback', () => {
    const callback = debounce(() => true);

    expect(callback).toEqual(expect.any(Function));
    expect(callback()).toBe(true);
  });
});
