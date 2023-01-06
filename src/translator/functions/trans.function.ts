import { inject } from '../../injector/functions/inject.function';
import { Translator } from '../translator.class';

export function trans(text: string, amount = 1) {
  const translator = inject(Translator);

  return translator.get(text, amount);
}
