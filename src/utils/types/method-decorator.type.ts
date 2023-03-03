export type MethodDecorator = (
  originalMethod: object | Function,
  context: ClassMethodDecoratorContext,
) => any;
