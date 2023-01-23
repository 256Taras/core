import { inject } from '../../injector/functions/inject.function';
import { Handler } from '../handler.class';

export function useDefault500(): () => void {
  const instance = inject(Handler);

  return instance.useDefaultErrorHandler;
}
