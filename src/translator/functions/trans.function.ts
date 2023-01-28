import { inject } from '../../injector/functions/inject.function.js';
import { Translator } from '../translator.service.js';

export function trans(text: string, amount = 1) {
  const translator = inject(Translator);

  return translator.get(text, amount);
}
