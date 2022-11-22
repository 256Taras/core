import { inject } from '../../injector/functions/inject.function';
import { Translator } from '../translator.class';

export const useTranslator = (): [
  (text: string) => string,
  (lang?: string) => void,
] => {
  const instance = inject(Translator);

  return [instance.get, instance.setLocale];
};
