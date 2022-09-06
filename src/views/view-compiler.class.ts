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

  private getRenderFunction(body: string, variables: Record<string, any> = {}) {
    const globalVariables = {
      ...constants,
      ...this.data,
      ...this.functions,
      $request: this.request,
    };

    const header = [
      ...Object.keys(globalVariables),
      ...Object.keys(variables),
      body,
    ];

    return (...args: unknown[]) => {
      return new Function(...header)(...Object.values(globalVariables), ...args);
    };
  }

  private parseDataRenders(): void {
    const matches = this.html.matchAll(/\{(@?)(.*?)\}/g) ?? [];

    for (const match of matches) {
      const value = JSON.stringify(match[2]);

      const fn = this.getRenderFunction(
        `return ${
          match[1] === '@' ? true : false
        } ? String(${value}) : String(${value}).replace(/[&<>'"]/g, (char) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;',
        }[char]));`,
      );

      const returnedValue: unknown = fn();

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

      const fn = this.getRenderFunction(`return ${value};`);

      const iterable: unknown[] = fn();
      const variableName = match[1];

      let result = '';
      let counter = 0;

      [...iterable].map((item) => {
        let content = match[4];

        const renderScopeVariables = {
          [variableName]: item,
          $first: counter === 0,
          $last: counter === Object.keys(iterable).length - 1,
          $even: counter % 2 === 0,
          $odd: counter % 2 === 1,
        };

        const renderMatches = content.matchAll(/\{(@?)(.*?)\}/g);

        for (const renderMatch of renderMatches) {
          const renderValue = renderMatch[2];

          const renderFn = this.getRenderFunction(
            `return ${renderValue};`,
            renderScopeVariables,
          );

          const renderResult: unknown = renderFn(
            ...Object.values(renderScopeVariables),
          );

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

      const fn = this.getRenderFunction(`return ${value};`);

      const condition: boolean = fn();

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

      const fn = this.getRenderFunction(`return ${value};`);

      const condition: boolean = fn();

      if (condition) {
        this.html = this.html.replace(match[0], match[3]);

        continue;
      }

      this.html = this.html.replace(match[0], match[6]);
    }
  }

  private parseJsonDirectives(): void {
    const matches = this.html.matchAll(/\[json (.*?)\]/g) ?? [];

    for (const match of matches) {
      this.html = this.html.replace(match[0], JSON.stringify(match[1]));
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
    this.parseJsonDirectives();
    this.parseTokenDirectives();
    this.parseMethodDirectives();

    this.restoreRawContent();

    return this.html;
  }
}
