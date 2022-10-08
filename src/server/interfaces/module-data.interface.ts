import { Constructor } from '../../utils/interfaces/constructor.interface';

export interface ModuleData {
  controllers?: Constructor[];
  socketChannels?: Constructor[];
}
