import * as constants from '../constants';

export class Compiler {
  private static rawContent: string[] = [];

  public static parseDataRenders(html: string, data: Record<string, any>): string {
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

  public static parseRawDirectives(html: string): string {
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

  public static restoreRawContent(html: string): string {
    const matches = html.matchAll(/\$\$raw([0-9]+)/g) ?? [];

    for (const match of matches) {
      const index = parseInt(match[1]);

      html = html.replace(match[0], this.rawContent[index]);
    }

    return html;
  }
}
