import { Constructor } from '../interfaces/constructor.interface.js';

export type ClassDecorator<T extends Function = any> = (
  originalClass: Constructor<T>,
  context: ClassDecoratorContext,
) => T | void;
