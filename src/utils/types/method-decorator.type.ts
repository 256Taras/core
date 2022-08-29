import { Constructor } from '../interfaces/constructor.interface';

export interface MethodTarget extends Object {
  constructor: Constructor;
}

export type MethodDecorator = <T = any>(
  target: MethodTarget,
  propertyKey: string | symbol,
  descriptor?: TypedPropertyDescriptor<T>,
) => void | TypedPropertyDescriptor<T>;
