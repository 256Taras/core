import { Parameter } from './parameter.interface.js';

export interface CommandOptions {
  signature?: string;
  signatures?: string[];
  parameters?: Record<string, Parameter>;
}
