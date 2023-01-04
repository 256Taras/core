import { inject } from '../../injector/functions/inject.function';
import { Translator } from '../translator.class';

export const useTranslator = (): [
  (text: string) => string,
  (lang: string) => Promise<void>,
] => {
  const instance = inject(Translator);

  return [instance.get, instance.setRequestLocale];
};
