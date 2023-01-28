import { Constructor } from '../interfaces/constructor.interface.js';

export type ClassDecorator<T extends Function = any> = (
  target: Constructor<T>,
) => T | void;
