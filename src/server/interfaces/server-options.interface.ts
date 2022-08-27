import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Module } from './module.interface';

export interface ServerOptions {
  config?: {
    envFile?: string;
    language?: string;
    contentSecurityPolicy?: Record<string, string | string[]> | false;
    cors?: {
      origin: string | boolean | RegExp | string[] | RegExp[];
      methods?: string | string[];
    };
    dev?: {
      openBrowser?: boolean;
    };
  };
  modules: Constructor<Module>[];
}
