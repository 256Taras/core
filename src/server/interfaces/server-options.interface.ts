import { AppConfig } from '../../configurator/interfaces/app-config.interface';
import { Constructor } from '../../utils/interfaces/constructor.interface';

export interface ServerOptions {
  config?: AppConfig;
  modules: Constructor[];
}
