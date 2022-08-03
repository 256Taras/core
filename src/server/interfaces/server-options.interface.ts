import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Module } from './module.interface';

export interface ServerOptions {
  config: {
    openBrowser?: boolean;
  },
  modules: Constructor<Module>[];
}
