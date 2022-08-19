import { runCommand } from '../../src/utils/functions/run-command.function';
import { describe, expect, it } from 'vitest';

describe('runCommand function', () => {
  it('returns correctly debounced callback', () => {
    const success = runCommand('npm -v');

    expect(success).toBe(true);
  });
});
