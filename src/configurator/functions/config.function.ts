import { Configurator } from '../configurator.class';
import { inject } from '../../injector/functions/inject.function';

export const config = <T = string>(option: string) => {
  return inject(Configurator).get<T>(option);
}
