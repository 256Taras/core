import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Module } from './module.interface';

export interface ServerOptions {
  config?: {
    language?: string;
    dev?: {
      openBrowser?: boolean;
    };
  };
  modules: Constructor<Module>[];
}
