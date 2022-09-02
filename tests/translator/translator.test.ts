import { describe, expect, it } from 'vitest';
import { inject } from '../../src/injector/functions/inject.function';
import { Translator } from '../../src/translator/translator.class';

describe('Translator class', () => {
  const translator = inject(Translator);

  it('returns proper translations', () => {
    const message = 'hello';

    expect(translator.get(message)).toBe(message);
  });
});
