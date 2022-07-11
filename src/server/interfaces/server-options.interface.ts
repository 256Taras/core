import { Constructor } from '../../utils/interfaces/constructor.interface';

export interface ServerOptions {
  controllers: Constructor[];
  channels: Constructor[];
}
