import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Module } from './module.interface';

export interface ServerOptions {
  config?: {
    envFile?: string;
    language?: string;
    contentSecurityPolicy?: Record<string, string | string[]>,
    dev?: {
      openBrowser?: boolean;
    };
  };
  modules: Constructor<Module>[];
}
