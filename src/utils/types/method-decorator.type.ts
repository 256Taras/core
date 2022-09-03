import { Constructor } from '../interfaces/constructor.interface';

export type MethodDecorator = <T = any>(
  target: Constructor,
  propertyKey: string | symbol,
  descriptor?: TypedPropertyDescriptor<T>,
) => void | TypedPropertyDescriptor<T>;
