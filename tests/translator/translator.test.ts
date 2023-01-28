import { describe, expect, it } from 'vitest';
import { inject } from '../../src/injector/functions/inject.function.js';
import { Translator } from '../../src/translator/translator.class.js';

describe('Translator class', () => {
  const translator = inject(Translator);

  it('returns proper translations', () => {
    const message = 'hello';

    expect(translator.get(message)).toBe(message);
  });
});
