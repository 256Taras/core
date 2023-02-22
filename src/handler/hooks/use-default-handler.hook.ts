import { inject } from '../../injector/functions/inject.function.js';
import { Handler } from '../handler.service.js';

export function useDefaultHandler() {
  const instance = inject(Handler);

  instance.pass();
}
