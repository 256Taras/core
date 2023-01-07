import { Integer } from './integer.type';

export type ParameterDecorator = (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: Integer,
) => void;
