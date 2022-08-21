import { inject } from '../../injector/functions/inject.function';
import { Translator } from '../translator.class';

export const trans = (text: string) => {
  const translator = inject(Translator);

  return translator.get(text);
};
