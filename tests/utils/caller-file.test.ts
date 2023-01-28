import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { callerFile } from '../../src/utils/functions/caller-file.function.js';

describe('callerFile function', () => {
  it('returns valid file path', () => {
    const file = callerFile();
    const fileExists = existsSync(file);

    expect(fileExists).toBe(true);
  });
});
