import * as constants from '../constants';
import { encode } from 'html-entities';
import { Exception } from '../handler/exception.class';
import { readFileSync } from 'fs';

export class Compiler {
  public static parse(filePath: string, variables: Record<string, any>, callback: (e: any, rendered?: string | undefined) => void) {
    let compiled = readFileSync(filePath).toString();

    for (const expression of compiled.matchAll(/\{([a-zA-Z0-9]*?)\}/g) ?? []) {
      const name: string = expression[1];
      const isConstant = name.startsWith('NUCLEON_') || name.startsWith('NODE_');

      let variableValue: string = isConstant
        ? constants[name as keyof object]
        : variables[name];

      if (isConstant && !(name in constants)) {
        throw new Exception(`The '${name}' constant is not defined`);
      }

      if (!isConstant && !(name in variables)) {
        throw new Exception(`The '${name}' variable has not been passed to the view`);
      }

      variableValue = Array.isArray(variableValue) || typeof variableValue === 'object'
        ? JSON.stringify(variableValue)
        : encode(String(variableValue));

      compiled = compiled.replace(expression[0], variableValue);
    }

    return callback(null, compiled);
  }
}
