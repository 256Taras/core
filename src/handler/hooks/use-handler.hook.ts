import { inject } from '../../injector/functions/inject.function.js';
import { Handler } from '../handler.service.js';

export function useHandler(): [(error: Error) => Promise<void>, () => void] {
  const instance = inject(Handler);

  return [instance.handleError, instance.pass];
}
