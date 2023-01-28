import { Integer } from './integer.type.js';

export type ParameterDecorator = (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: Integer,
) => void;
