import { inject } from '../../injector/functions/inject.function';
import { Handler } from '../handler.service';

export function useDefault404(): () => void {
  const instance = inject(Handler);

  return instance.useDefaultNotFound;
}
