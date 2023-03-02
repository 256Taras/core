export type MethodDecorator = (
  originalMethod: object | Function,
  context: ClassMethodDecoratorContext,
) => void | object | Function;
