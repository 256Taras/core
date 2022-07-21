import * as constants from '../constants';
import { Exception } from '../handler/exception.class';
import { encode } from 'html-entities';
import { readFileSync } from 'node:fs';

export class View {
  public static parse(
    filePath: string,
    variables: Record<string, any>,
    callback: (e: any, rendered?: string | undefined) => void,
  ) {
    let compiled = readFileSync(filePath).toString();

    for (const expression of compiled.matchAll(/\{(\*?)([a-zA-Z0-9]*?)\}/g) ?? []) {
      const name: string = expression[2];
      const isConstant = name.startsWith('NUCLEON_') || name.startsWith('NODE_');

      let variableValue: string = isConstant
        ? constants[name as keyof object]
        : variables[name];

      if (isConstant && !(name in constants)) {
        throw new Exception(`The '${name}' constant is not defined`);
      }

      if (!isConstant && !(name in variables)) {
        throw new Exception(
          `The '${name}' variable has not been passed to the view`,
        );
      }

      const plainValue = expression[1] ? variableValue : encode(variableValue);

      variableValue =
        Array.isArray(variableValue) || typeof variableValue === 'object'
          ? JSON.stringify(variableValue)
          : plainValue;

      compiled = compiled.replace(expression[0], variableValue);
    }

    return callback(null, compiled);
  }
}
