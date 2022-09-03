import * as constants from '../constants';
import { Request } from '../http/request.class';
import { Service } from '../injector/decorators/service.decorator';
import { trans } from '../translator/functions/trans.function';

@Service()
export class ViewCompiler {
  private data: Record<string, any> = {};

  private html: string;

  private functions = {
    trans,
  };

  private rawContent: string[] = [];

  constructor(private request: Request) {}

  private parseDataRenders(): void {
    const matches = this.html.matchAll(/\{(@?)(.*?)\}/g) ?? [];

    for (const match of matches) {
      const value: string = match[2];

      const scopeVariables = {
        ...constants,
        ...this.data.variables,
        ...this.functions,
        $request: this.request,
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

      this.html = this.html.replace(match[0], String(returnedValue));
    }
  }

  private parseEachDirectives(): void {
    const matches =
      this.html.matchAll(
        /\[each (.*?) in (.*)\](\n|\r\n)?((.*?|\s*?)*?)\[\/each\]/gm,
      ) ?? [];

    for (const match of matches) {
      const value = match[2];

      const scopeVariables = {
        ...constants,
        ...this.data.variables,
        ...this.functions,
        $request: this.request,
      };

      const functionHeader = [...Object.keys(scopeVariables), `return ${value};`];
      const fn = new Function(...functionHeader);

      const iterable: any[] = fn(...Object.values(scopeVariables));
      const variableName = match[1];

      let result = '';
      let counter = 0;

      [...iterable].map((item) => {
        let content = match[4];

        const renderScopeVariables = {
          ...scopeVariables,
          [variableName]: item,
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

      this.html = this.html.replace(match[0], result);
    }
  }

  private parseIfDirectives(): void {
    const matches =
      this.html.matchAll(/\[if ?(.*?)\](\n|\r\n*?)?((.|\n|\r\n)*?)\[\/if\]/gm) ?? [];

    for (const match of matches) {
      const value = match[1];

      const scopeVariables = {
        ...constants,
        ...this.data.variables,
        ...this.functions,
        $request: this.request,
      };

      const functionHeader = [...Object.keys(scopeVariables), `return ${value};`];
      const fn = new Function(...functionHeader);

      const condition: boolean = fn(...Object.values(scopeVariables));

      if (condition) {
        this.html = this.html.replace(match[0], match[3]);

        continue;
      }

      this.html = this.html.replace(match[0], '');
    }
  }

  private parseIfElseDirectives(): void {
    const matches =
      this.html.matchAll(
        /\[if ?(.*?)\](\n|\r\n*?)?((.|\n|\r\n)*?)(\[else\])((.|\n|\r\n)*?)\[\/if\]/gm,
      ) ?? [];

    for (const match of matches) {
      const value = match[1];

      const scopeVariables = {
        ...constants,
        ...this.data.variables,
        ...this.functions,
        $request: this.request,
      };

      const functionHeader = [...Object.keys(scopeVariables), `return ${value};`];
      const fn = new Function(...functionHeader);

      const condition: boolean = fn(...Object.values(scopeVariables));

      if (condition) {
        this.html = this.html.replace(match[0], match[3]);

        continue;
      }

      this.html = this.html.replace(match[0], match[6]);
    }
  }

  private parseTokenDirectives(): void {
    const matches = this.html.matchAll(/\[token\]/g) ?? [];
    const token = this.request.token();

    for (const match of matches) {
      this.html = this.html.replace(
        match[0],
        `<input type="hidden" name="_token" value="${token}">`,
      );
    }
  }

  private parseMethodDirectives(): void {
    const matches =
      this.html.matchAll(
        /\[(copy|delete|get|head|lock|mkcol|move|options|patch|post|propfind|proppatch|put|search|trace|unlock)\]/g,
      ) ?? [];

    for (const match of matches) {
      this.html = this.html.replace(
        match[0],
        `<input type="hidden" name="_method" value="${match[1].toUpperCase()}">`,
      );
    }
  }

  private parseRawDirectives(): void {
    const matches =
      this.html.matchAll(/\[raw\](\n|\r\n)?((.*?|\s*?)*?)\[\/raw\]/gm) ?? [];

    let count = 0;

    for (const match of matches) {
      this.html = this.html.replace(match[0], `$_raw${count}`);
      count += 1;

      this.rawContent.push(match[2]);
    }
  }

  private restoreRawContent(): void {
    const matches = this.html.matchAll(/\$_raw([0-9]+)/g) ?? [];

    for (const match of matches) {
      const index = parseInt(match[1]);

      this.html = this.html.replace(match[0], this.rawContent[index]);
    }
  }

  public compile(html: string, data: Record<string, any> = {}): string {
    this.data = data;
    this.html = html;
    this.rawContent = [];

    this.parseRawDirectives();
    this.parseEachDirectives();
    this.parseDataRenders();
    this.parseIfElseDirectives();
    this.parseIfDirectives();
    this.parseTokenDirectives();
    this.parseMethodDirectives();

    this.restoreRawContent();

    return this.html;
  }
}
