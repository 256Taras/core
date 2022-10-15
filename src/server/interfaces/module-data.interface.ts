import { Constructor } from '../../utils/interfaces/constructor.interface';

export interface ModuleData {
  imports?: Constructor[];
  controllers?: Constructor[];
  socketChannels?: Constructor[];
}
