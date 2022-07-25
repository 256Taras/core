import * as constants from '../constants';
import { encode } from 'html-entities';
import { readFileSync } from 'node:fs';

export class View {
  public static parse(
    filePath: string,
    data: Record<string, any>,
    callback: (e: any, rendered?: string | undefined) => void,
  ) {
    let compiled = readFileSync(filePath).toString();

    for (const expression of compiled.matchAll(/\{(\*?)(.*?)\}/g) ?? []) {
      const value: string = expression[2];

      const scopeVariables = {
        ...constants,
        ...data,
      };

      const functionHeaderData = [
        ...Object.keys(scopeVariables),
        `return ${value}`,
      ];

      const fn = new Function(...functionHeaderData);

      const returnedValue = fn(...Object.values(scopeVariables));

      compiled = compiled.replace(expression[0], returnedValue);
    }

    return callback(null, compiled);
  }
}
