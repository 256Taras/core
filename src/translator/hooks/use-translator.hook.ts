import { inject } from '../../injector/functions/inject.function';
import { Translator } from '../translator.service';

export function useTranslator(): [
  (text: string) => string,
  (lang: string) => Promise<void>,
] {
  const instance = inject(Translator);

  return [instance.get, instance.setRequestLocale];
}
