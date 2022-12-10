import { Constructor } from '../../utils/interfaces/constructor.interface';
import { AppConfig } from '../../configurator/interfaces/app-config.interface';

export interface ServerOptions {
  config?: AppConfig;
  modules: Constructor[];
}
