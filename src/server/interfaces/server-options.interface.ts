import { Constructor } from '../../utils/interfaces/constructor.interface';

export interface ServerOptions<DatabaseClient> {
  controllers: Constructor[];
  channels?: Constructor[];
  databaseClient?: Constructor<DatabaseClient>;
}
