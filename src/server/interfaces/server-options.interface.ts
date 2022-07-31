import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Module } from '../module.class';

export interface ServerOptions<DatabaseClient> {
  databaseClient?: Constructor<DatabaseClient>;
  modules: Module[];
}
