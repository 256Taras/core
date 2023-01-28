import { inject } from '../../injector/functions/inject.function.js';
import { Translator } from '../translator.service.js';

export function useTranslator(): [
  (text: string) => string,
  (lang: string) => Promise<void>,
] {
  const instance = inject(Translator);

  return [instance.get, instance.setRequestLocale];
}
