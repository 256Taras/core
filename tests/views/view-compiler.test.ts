import { describe, expect, it } from 'vitest';
import { inject } from '../../src/injector/functions/inject.function';
import { ViewCompiler } from '../../src/views/view-compiler.class';

describe('ViewCompiler class', () => {
  const compiler = inject(ViewCompiler);

  it('correctly compiles template', async () => {
    const template = '[if condition]{message}[/if]';

    const data = {
      message: 'Test',
      condition: true,
    };

    const compiled = await compiler.compile(template, data);

    expect(compiled).toBe(data.message);
  });
});
