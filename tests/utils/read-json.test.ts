import { describe, expect, it } from 'vitest';
import { readJson } from '../../src/utils/functions/read-json.function.js';

describe('readJson function', () => {
  it('reads JSON data from file', async () => {
    const data = await readJson('package.json');

    expect(data?.name).toBe('@northle/core');
  });
});
