export type MethodDecorator = <T = any>(
  target: any,
  propertyKey: string | symbol,
  descriptor?: TypedPropertyDescriptor<T>,
) => void | TypedPropertyDescriptor<T>;
