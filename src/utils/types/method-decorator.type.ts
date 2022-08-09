interface Target extends Object {
  constructor: any;
}

export type MethodDecorator = <T = any>(
  target: Target,
  propertyKey: string | symbol,
  descriptor?: TypedPropertyDescriptor<T>,
) => void | TypedPropertyDescriptor<T>;
