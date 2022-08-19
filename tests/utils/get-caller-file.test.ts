import { getCallerFile } from '../../src/utils/functions/get-caller-file.function';
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';

describe('getCallerFile function', () => {
  it('returns valid file path', () => {
    const file = getCallerFile();
    const fileExists = existsSync(file);

    expect(fileExists).toBe(true);
  });
});
