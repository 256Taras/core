import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Module } from './module.interface';

export interface ServerOptions<DatabaseClient> {
  databaseClient?: Constructor<DatabaseClient>;
  modules: Constructor<Module>[];
}
