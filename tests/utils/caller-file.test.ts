import { callerFile } from '../../src/utils/functions/caller-file.function';
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';

describe('callerFile function', () => {
  it('returns valid file path', () => {
    const file = callerFile();
    const fileExists = existsSync(file);

    expect(fileExists).toBe(true);
  });
});
