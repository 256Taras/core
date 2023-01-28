import { inject } from '../../injector/functions/inject.function.js';
import { Configurator } from '../configurator.service.js';

export function useConfig<T = string>(option: string): T {
  const instance = inject(Configurator);

  return instance.get<T>(option);
}
