import { describe, expect, it } from 'vitest';
import { inject } from '../../src/injector/functions/inject.function';
import { ViewCompiler } from '../../src/views/view-compiler.class';

describe('ViewCompiler class', () => {
  const compiler = inject(ViewCompiler);

  it('correctly compiles data renders', async () => {
    const template = '{{ count + 1 }}';

    const data = {
      count: 2,
    };

    const compiled = await compiler.compile(template, data);

    expect(compiled).toBe('3');
  });

  it('correctly compiles [each] blocks', async () => {
    const template = '[each (item in 3)]{{ item }}[/each]';

    const compiled = await compiler.compile(template);

    expect(compiled).toBe('0123');
  });

  it('correctly compiles [if] blocks', async () => {
    const template = '[if (true)]northle[/if]';

    const compiled = await compiler.compile(template);

    expect(compiled).toBe('northle');
  });

  it('correctly compiles [method] blocks', async () => {
    const template = `[method('POST')]`;

    const compiled = await compiler.compile(template);

    expect(compiled.includes('<input')).toBe(true);
  });

  it('correctly compiles [token] blocks', async () => {
    const template = `[token]`;

    const compiled = await compiler.compile(template);

    expect(compiled.includes('<input')).toBe(true);
  });
});
