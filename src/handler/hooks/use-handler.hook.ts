import { inject } from '../../injector/functions/inject.function';
import { Handler } from '../handler.service';

export function useHandler(): [
  (error: Error) => Promise<void>,
  () => void,
  () => void,
] {
  const instance = inject(Handler);

  return [
    instance.handleError,
    instance.useDefaultNotFound,
    instance.useDefaultErrorHandler,
  ];
}
