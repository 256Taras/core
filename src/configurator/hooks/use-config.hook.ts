import { inject } from '../../injector/functions/inject.function';
import { Configurator } from '../configurator.class';

export function useConfig<T = string>(option: string): T {
  const instance = inject(Configurator);

  return instance.get<T>(option);
}
