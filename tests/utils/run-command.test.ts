import { describe, expect, it } from 'vitest';
import { runCommand } from '../../src/utils/functions/run-command.function.js';

describe('runCommand function', () => {
  it('executes system commands', () => {
    const success = runCommand('npm -v');
    const failure = runCommand('non-existing-command');

    expect(success).toBe(true);
    expect(failure).toBe(false);
  });
});
