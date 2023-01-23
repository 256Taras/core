import { inject } from '../../injector/functions/inject.function';
import { Translator } from '../translator.service';

export function trans(text: string, amount = 1) {
  const translator = inject(Translator);

  return translator.get(text, amount);
}
