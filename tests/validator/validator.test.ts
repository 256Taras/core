import { describe, expect, it } from 'vitest';
import { inject } from '../../src/injector/functions/inject.function';
import { Validator } from '../../src/validator/validator.class';

describe('Validator class', () => {
  const validator = inject(Validator);

  it('asserts data is valid', async () => {
    const isValid = validator.assert({
      name: {
        required: true,
      },
    });

    expect(isValid).toBe(false);
  });
});
