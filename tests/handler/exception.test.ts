import { Exception } from '../../src/handler/exception.class';
import { describe, expect, it } from 'vitest';

describe('Exception class', () => {
  it('properly constructs exceptions', () => {
    const exception = new Exception('Test');

    expect(exception.name).toBe('Exception');
  });
});
