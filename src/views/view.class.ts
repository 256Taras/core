import * as constants from '../constants';
import { Handler } from '../handler/handler.class';
import { Request, Response } from 'express';
import { encode } from 'html-entities';
import { readFileSync } from 'node:fs';

export class View {
  private static rawContent: string[] = [];

  private static parseDataRenders(html: string, data: Record<string, any>): string {
    for (const expression of html.matchAll(/\{(@?)(.*?)\}/g) ?? []) {
      const value: string = expression[2];

      const scopeVariables = {
        ...constants,
        ...data.variables,
      };

      const functionHeaderData = [...Object.keys(scopeVariables), `return ${value}`];

      const fn = new Function(...functionHeaderData);

      const returnedValue = fn(...Object.values(scopeVariables));

      html = html.replace(expression[0], returnedValue);
    }

    return html;
  }

  private static parseRawDirectives(html: string): string {
    let count = 0;

    for (const match of html.matchAll(
      /\[raw\](\n|\r\n)?((.*?|\s*?)*?)\[\/raw\]/gm,
    ) ?? []) {
      html = html.replace(match[0], `$$raw${count}`);
      count += 1;

      this.rawContent.push(match[2]);
    }

    return html;
  }

  private static restoreRawContent(html: string): string {
    const matches = html.matchAll(/\$\$raw([0-9]+)/g) ?? [];

    for (const match of matches) {
      const index = parseInt(match[1]);

      html = html.replace(match[0], this.rawContent[index]);
    }

    return html;
  }

  public static parse(
    filePath: string,
    data: Record<string, any>,
    callback: (e: any, rendered?: string | undefined) => void,
  ) {
    let html = readFileSync(filePath).toString();

    html = this.parseRawDirectives(html);
    html = this.parseDataRenders(html, data);
    html = this.restoreRawContent(html);

    return callback(null, html);
  }

  public static render(
    request: Request,
    response: Response,
    filePath: string,
    data: Record<string, any>,
  ): void {
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
