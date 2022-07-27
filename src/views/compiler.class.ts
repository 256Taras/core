import * as constants from '../constants';

export class Compiler {
  private static rawContent: string[] = [];

  public static compile(html: string, data: Record<string, any>): string {
    html = this.parseRawDirectives(html);
    html = this.parseEachDirectives(html);
    html = this.parseDataRenders(html, data);
    html = this.parseIfDirectives(html);
    html = this.parseTokenDirectives(html);
    html = this.parseMethodDirectives(html);
    html = this.restoreRawContent(html);

    return html;
  }

  private static parseDataRenders(html: string, data: Record<string, any>): string {
    const matches = html.matchAll(/\{(@?)(.*?)\}/g) ?? [];

    for (const expression of matches) {
      const value: string = expression[2];

      const scopeVariables = {
        ...constants,
        ...data.variables,
      };

      const functionHeaderData = [
        ...Object.keys(scopeVariables),
        `return String(${value}).replace(/[&<>'"]/g, (char) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;',
        }[char]));`,
      ];

      const fn = new Function(...functionHeaderData);

      const returnedValue = fn(...Object.values(scopeVariables));

      html = html.replace(expression[0], returnedValue);
    }

    return html;
  }

  private static parseEachDirectives(
    html: string,
    data: Record<string, any> = {},
  ): string {
    const matches =
      html.matchAll(/\[each (.*?) in (.*)\](\n|\r\n)?((.*?|\s*?)*?)\[\/each\]/gm) ??
      [];

    for (const match of matches) {
      const value = match[2];

      const scopeVariables = {
        ...constants,
        ...data.variables,
      };

      const functionHeaderData = [
        ...Object.keys(scopeVariables),
        `return ${value};`,
      ];

      const fn = new Function(...functionHeaderData);

      const iterable = fn(...Object.values(scopeVariables));

      let result = '';

      [...iterable].map((item: any) => {
        for (const variable of match[4].matchAll(/\{(@?)(.*?)\}/g)) {
          if (variable[2] === match[1]) {
            result += match[4].replace(variable[0], String(item));
          }
        }
      });

      html = html.replace(match[0], result);
    }

    return html;
  }

  private static parseIfDirectives(
    html: string,
    data: Record<string, any> = {},
  ): string {
    const matches =
      html.matchAll(/\[if (not)? ?(.*?)\](\n|\r\n)?((.*?|\s*?)*?)\[\/if\]/gm) ?? [];

    for (const match of matches) {
      const value = match[2];

      const scopeVariables = {
        ...constants,
        ...data.variables,
      };

      const functionHeaderData = [
        ...Object.keys(scopeVariables),
        `return ${value};`,
      ];

      const fn = new Function(...functionHeaderData);

      const condition = fn(...Object.values(scopeVariables));

      if (condition || (match[1] === 'not' && !condition)) {
        html = html.replace(match[0], match[4]);
      }
    }

    return html;
  }

  private static parseTokenDirectives(html: string): string {
    const matches = html.matchAll(/\[token\]/g) ?? [];
    const token = '';

    for (const match of matches) {
      html = html.replace(
        match[0],
        `<input type="hidden" name="_token" value="${token}">`,
      );
    }

    return html;
  }

  private static parseMethodDirectives(html: string): string {
    const matches = html.matchAll(/\[method '?([a-zA-z]*?)'?\]/g) ?? [];

    for (const match of matches) {
      html = html.replace(
        match[0],
        `<input type="hidden" name="_method" value="${match[1].toUpperCase()}">`,
      );
    }

    return html;
  }

  private static parseRawDirectives(html: string): string {
    const matches =
      html.matchAll(/\[raw\](\n|\r\n)?((.*?|\s*?)*?)\[\/raw\]/gm) ?? [];

    let count = 0;

    for (const match of matches) {
      html = html.replace(match[0], `$_raw${count}`);
      count += 1;

      this.rawContent.push(match[2]);
    }

    return html;
  }

  private static restoreRawContent(html: string): string {
    const matches = html.matchAll(/\$_raw([0-9]+)/g) ?? [];

    for (const match of matches) {
      const index = parseInt(match[1]);

      html = html.replace(match[0], this.rawContent[index]);
    }

    return html;
  }
}
