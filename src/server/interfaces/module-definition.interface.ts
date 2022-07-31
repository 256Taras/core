import { Constructor } from '../../utils/interfaces/constructor.interface';

export interface ModuleDefinition {
  controllers: Constructor[];
  channels: Constructor[];
}
