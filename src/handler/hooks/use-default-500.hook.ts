import { inject } from '../../injector/functions/inject.function.js';
import { Handler } from '../handler.service.js';

export function useDefault500(): () => void {
  const instance = inject(Handler);

  return instance.useDefaultErrorHandler;
}
