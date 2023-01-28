import { Constructor } from '../../utils/interfaces/constructor.interface.js';

export interface ModuleData {
  imports?: Constructor[];
  controllers?: Constructor[];
  socketChannels?: Constructor[];
}
