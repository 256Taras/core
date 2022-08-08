import * as constants from '../constants';
import { Service } from '../injector/decorators/service.decorator';

@Service()
export class Compiler {
  private rawContent: string[] = [];

  public compile(html: string, data: Record<string, any>): string {
    html = this.parseRawDirectives(html);
    html = this.parseEachDirectives(html, data);
    html = this.parseDataRenders(html, data);
    html = this.parseIfElseDirectives(html, data);
    html = this.parseIfDirectives(html, data);
    html = this.parseTokenDirectives(html);
    html = this.parseMethodDirectives(html);
    html = this.restoreRawContent(html);

    return html;
  }

  private parseDataRenders(html: string, data: Record<string, any>): string {
    const matches = html.matchAll(/\{(@?)(.*?)\}/g) ?? [];

    for (const match of matches) {
      const value: string = match[2];

      const scopeVariables = {
        ...constants,
        ...data.variables,
      };

      const functionHeader = [
        ...Object.keys(scopeVariables),
        `return ${
          match[1] === '@' ? true : false
        } ? String(${value}) : String(${value}).replace(/[&<>'"]/g, (char) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;',
        }[char]));`,
      ];

      const fn = new Function(...functionHeader);

      const returnedValue: any = fn(...Object.values(scopeVariables));

      html = html.replace(match[0], String(returnedValue));
    }

    return html;
  }

  private parseEachDirectives(html: string, data: Record<string, any>): string {
    const matches =
      html.matchAll(/\[each (.*?) in (.*)\](\n|\r\n)?((.*?|\s*?)*?)\[\/each\]/gm) ??
      [];

    for (const match of matches) {
      const value = match[2];

      const scopeVariables = {
        ...constants,
        ...data.variables,
      };

      const functionHeader = [...Object.keys(scopeVariables), `return ${value};`];

      const fn = new Function(...functionHeader);

      const iterable: any[] = fn(...Object.values(scopeVariables));

      const variableName = match[1];

      let result = '';
      let counter = 0;

      [...iterable].map((item: any) => {
        let content = match[4];

        const renderScopeVariables = {
          [variableName]: item,
          ...constants,
          ...data.variables,
          $first: counter === 0,
          $last: counter === Object.keys(iterable).length - 1,
          $even: counter % 2 === 0,
          $odd: counter % 2 === 1,
        };

        const renderMatches = content.matchAll(/\{(@?)(.*?)\}/g);

        for (const renderMatch of renderMatches) {
          const renderValue = renderMatch[2];

          const renderFunctionHeader = [
            ...Object.keys(renderScopeVariables),
            `return ${renderValue};`,
          ];

          const renderFn = new Function(...renderFunctionHeader);

          const renderResult: any = renderFn(...Object.values(renderScopeVariables));

          content = content.replace(renderMatch[0], String(renderResult));
        }

        result += content;

        counter += 1;
      });

      html = html.replace(match[0], result);
    }

    return html;
  }

  private parseIfDirectives(html: string, data: Record<string, any>): string {
    const matches =
      html.matchAll(/\[if ?(.*?)\](\n|\r\n*?)?((.|\n|\r\n)*?)\[\/if\]/gm) ?? [];

    for (const match of matches) {
      const value = match[1];

      const scopeVariables = {
        ...constants,
        ...data.variables,
      };

      const functionHeader = [...Object.keys(scopeVariables), `return ${value};`];

      const fn = new Function(...functionHeader);

      const condition: boolean = fn(...Object.values(scopeVariables));

      if (condition) {
        html = html.replace(match[0], match[3]);

        continue;
      }

      html = html.replace(match[0], '');
    }

    return html;
  }

  private parseIfElseDirectives(html: string, data: Record<string, any>): string {
    const matches =
      html.matchAll(
        /\[if ?(.*?)\](\n|\r\n*?)?((.|\n|\r\n)*?)(\[else\])((.|\n|\r\n)*?)\[\/if\]/gm,
      ) ?? [];

    for (const match of matches) {
      const value = match[1];

      const scopeVariables = {
        ...constants,
        ...data.variables,
      };

      const functionHeader = [...Object.keys(scopeVariables), `return ${value};`];

      const fn = new Function(...functionHeader);

      const condition: boolean = fn(...Object.values(scopeVariables));

      if (condition) {
        html = html.replace(match[0], match[3]);

        continue;
      }

      html = html.replace(match[0], match[6]);
    }

    return html;
  }

  private parseTokenDirectives(html: string): string {
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

  private parseMethodDirectives(html: string): string {
    const matches =
      html.matchAll(/\[(get|post|put|patch|delete|head|options)\]/g) ?? [];

    for (const match of matches) {
      html = html.replace(
        match[0],
        `<input type="hidden" name="_method" value="${match[1].toUpperCase()}">`,
      );
    }

    return html;
  }

  private parseRawDirectives(html: string): string {
    this.rawContent = [];

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

  private restoreRawContent(html: string): string {
    const matches = html.matchAll(/\$_raw([0-9]+)/g) ?? [];

    for (const match of matches) {
      const index = parseInt(match[1]);

      html = html.replace(match[0], this.rawContent[index]);
    }

    return html;
  }
}
