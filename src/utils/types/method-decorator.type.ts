export interface MethodTarget extends Object {
  constructor: any;
}

export type MethodDecorator = <T = any>(
  target: MethodTarget,
  propertyKey: string | symbol,
  descriptor?: TypedPropertyDescriptor<T>,
) => void | TypedPropertyDescriptor<T>;
