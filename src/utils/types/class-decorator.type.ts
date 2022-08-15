import { Constructor } from '../interfaces/constructor.interface';

// eslint-disable-next-line @typescript-eslint/ban-types
export type ClassDecorator<T extends Function> = (
  target: Constructor<T>,
) => T | void;
