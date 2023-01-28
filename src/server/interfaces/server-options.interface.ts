import { AppConfig } from '../../configurator/interfaces/app-config.interface.js';
import { Constructor } from '../../utils/interfaces/constructor.interface.js';

export interface ServerOptions {
  config?: AppConfig;
  modules: Constructor[];
}
