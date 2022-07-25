import * as constants from '../constants';
import { Handler } from '../handler/handler.class';
import { encode } from 'html-entities';
import { readFileSync } from 'node:fs';
import { Request, Response } from 'express';

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
        ...data.variables,
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

  public static render(request: Request, response: Response, filePath: string, data: Record<string, any>): void {
    const viewData = {
      variables: data,
    };

    response.render(filePath, viewData, (error: Error, html: string) => {
      if (error) {
        Handler.handleException(error, request, response);

        return;
      }

      response.send(html);
    });
  }
}
