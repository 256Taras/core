import { getCallerFile } from '../../src/utils/functions/get-caller-file.function';
import { describe, expect, it } from 'vitest';

describe('getCallerFile function', () => {
  it('returns valid file path', () => {
    const file = getCallerFile();

    expect(file).toEqual(import.meta.url);
  });
});
