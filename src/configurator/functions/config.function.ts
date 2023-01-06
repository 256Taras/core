import { inject } from '../../injector/functions/inject.function';
import { Configurator } from '../configurator.class';

export function config<T = string>(option: string) {
  return inject(Configurator).get<T>(option);
}
