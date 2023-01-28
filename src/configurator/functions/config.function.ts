import { inject } from '../../injector/functions/inject.function.js';
import { Configurator } from '../configurator.service.js';

export function config<T = string>(option: string) {
  return inject(Configurator).get<T>(option);
}
