import { describe, expect, it } from 'vitest';
import { range } from '../../src/utils/functions/range.function';

describe('range function', () => {
  it('creates a valid number range', () => {
    const items = range(10, 14);

    expect(items).toEqual([10, 11, 12, 13, 14]);
  });
});
