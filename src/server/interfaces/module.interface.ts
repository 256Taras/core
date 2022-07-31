import { Constructor } from '../../utils/interfaces/constructor.interface';

export interface Module {
  controllers: Constructor[];
  channels?: Constructor[];
}
