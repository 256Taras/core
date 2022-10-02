import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import * as constants from '../constants';
import { Request } from '../http/request.class';
import { Service } from '../injector/decorators/service.decorator';
import { inject } from '../injector/functions/inject.function';
import { session } from '../session/functions/session.function';
import { trans } from '../translator/functions/trans.function';
import { csrfToken } from '../utils/functions/csrf-token.function';
import { env } from '../utils/functions/env.function';
import { readJson } from '../utils/functions/read-json.function';

@Service()
export class ViewCompiler {
  private data: Record<string, any> = {};

  private file: string | null;

  private html: string;

  private functions = {
    csrfToken,
    inject,
    session,
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

    return <T>(...args: unknown[]): T => {
      return new Function(...header)(
        ...Object.values(globalVariables),
        ...args,
      ) as T;
    };
  }

  private parseDataDisplays(): void {
    const matches = this.html.matchAll(/\{\{(@?)(.*?)\}\}/g) ?? [];

    for (const match of matches) {
      const value = match[2].trim();

      const renderFunction = this.getRenderFunction(
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

      const returnedValue = renderFunction();

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
      const renderFunction = this.getRenderFunction(`return ${value};`);

      const iterable: unknown[] = renderFunction();
      const variableName = match[1];

      let result = '';

      [...iterable].map((item, index) => {
        let content = match[4];

        const renderScopeVariables = {
          [variableName]: item,
          $first: index === 0,
          $index: index,
          $last: index === Object.keys(iterable).length - 1,
          $even: index % 2 === 0,
          $odd: index % 2 === 1,
        };

        const renderMatches = content.matchAll(/\{(@?)(.*?)\}/g);

        for (const renderMatch of renderMatches) {
          const renderValue = renderMatch[2];

          const renderFn = this.getRenderFunction(
            `return ${renderValue};`,
            renderScopeVariables,
          );

          const renderResult = renderFn(...Object.values(renderScopeVariables));

          content = content.replace(renderMatch[0], String(renderResult));
        }

        result += content;
      });

      this.html = this.html.replace(match[0], result);
    }
  }

  private parseIfDirectives(): void {
    const matches =
      this.html.matchAll(/\[if ?(.*?)\](\n|\r\n*?)?((.|\n|\r\n)*?)\[\/if\]/gm) ?? [];

    for (const match of matches) {
      const value = match[1];
      const renderFunction = this.getRenderFunction(`return ${value};`);

      const condition: boolean = renderFunction();

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
      const renderFunction = this.getRenderFunction(`return ${value};`);

      const condition: boolean = renderFunction();

      if (condition) {
        this.html = this.html.replace(match[0], match[3]);

        continue;
      }

      this.html = this.html.replace(match[0], match[6]);
    }
  }

  private async parseIncludeDirectives(): Promise<void> {
    const matches = this.html.matchAll(/\[include *?\((.*?)\)\]/g) ?? [];

    for (const match of matches) {
      const value = match[1];
      const renderFunction = this.getRenderFunction(`return ${value};`);

      const partial = renderFunction<string>();

      const file = `${
        this.file ? this.file + '/..' : 'dist/app/views'
      }/${partial}.html`;

      if (!existsSync(file)) {
        throw new Error(`Template partial '${partial}' does not exist`);
      }

      const fileContent = await readFile(file, 'utf-8');

      const compiledPartial = await this.compile(fileContent, this.data, null, true);

      this.html = this.html.replace(match[0], compiledPartial);
    }
  }

  private parseJsonDirectives(): void {
    const matches =
      this.html.matchAll(/\[json *?\((.*?),? *?(true|false)?\)\]/g) ?? [];

    for (const match of matches) {
      const value = match[1];
      const prettyPrint = match[2] ?? 'false';

      const renderFunction = this.getRenderFunction(`return ${value};`);
      const printRenderFunction = this.getRenderFunction(`return ${prettyPrint};`);

      const json = JSON.stringify(
        renderFunction<object>(),
        undefined,
        printRenderFunction<boolean>() ? 2 : 0,
      );

      this.html = this.html.replace(match[0], json);
    }
  }

  private async parseTokenDirectives(): Promise<void> {
    const matches = this.html.matchAll(/\[token\]/g) ?? [];
    const token = await csrfToken();

    for (const match of matches) {
      this.html = this.html.replace(
        match[0],
        `<input type="hidden" name="_csrf" value="${token}">`,
      );
    }
  }

  private parseMethodDirectives(): void {
    const matches = this.html.matchAll(/\[method *?\((.*?)\)\]/g) ?? [];

    for (const match of matches) {
      const value = match[1];
      const renderFunction = this.getRenderFunction(`return ${value};`);

      this.html = this.html.replace(
        match[0],
        `<input type="hidden" name="_method" value="${renderFunction<string>().toUpperCase()}">`,
      );
    }
  }

  private parseRawDirectives(): void {
    const matches =
      this.html.matchAll(/\[raw\](\n|\r\n)?((.*?|\s*?)*?)\[\/raw\]/gm) ?? [];

    let count = 0;

    for (const match of matches) {
      this.html = this.html.replace(match[0], `$_raw${count}`);

      this.rawContent.push(match[2]);

      count += 1;
    }
  }

  private parseViteDirectives(): void {
    const matches = this.html.matchAll(/\[vite *?\((.*?)\)\]/gm) ?? [];

    for (const match of matches) {
      const value = match[1];
      const renderFunction = this.getRenderFunction(`return ${value};`);

      let fileEntries = renderFunction<string | string[]>();
      let output = '';
      let usesReactRefresh = false;

      if (!Array.isArray(fileEntries)) {
        fileEntries = [fileEntries];
      }

      fileEntries.map((fileEntry) => {
        const fileExtension = fileEntry.split('.').pop() ?? 'js';

        if (env<boolean>('DEVELOPMENT')) {
          output = `<script type="module" src="http://localhost:5173/app/${fileEntry}"></script>`;

          if (['jsx', 'tsx'].includes(fileExtension)) {
            usesReactRefresh = true;
          }
        } else {
          (async () => {
            const manifestPath = 'public/manifest.json';

            if (!existsSync(manifestPath)) {
              throw new Error('Vite manifest file not found');
            }

            const manifest = await readJson(manifestPath);

            const data = manifest[`app/${fileEntry}`];

            output = `
              ${data.css ? `<link rel="stylesheet" href="/${data.css}">` : ''}
    
              <script type="module" src="/${data.file}"></script>
            `;
          })();
        }
      });

      if (usesReactRefresh) {
        output = `
          <script type="module">
            import RefreshRuntime from 'http://localhost:5173/@react-refresh';

            RefreshRuntime.injectIntoGlobalHook(window);

            window.$RefreshReg$ = () => {};
            window.$RefreshSig$ = () => (type) => type;
            window.__vite_plugin_react_preamble_installed__ = true;
          </script>

          ${output}
        `;
      }

      this.html = this.html.replace(match[0], output);
    }
  }

  private restoreRawContent(): void {
    const matches = this.html.matchAll(/\$_raw([0-9]+)/g) ?? [];

    for (const match of matches) {
      const index = parseInt(match[1]);

      this.html = this.html.replace(match[0], this.rawContent[index]);
    }
  }

  public async compile(
    html: string,
    data: Record<string, any> = {},
    file: string | null = null,
    isPartial = false,
  ): Promise<string> {
    this.data = data;
    this.html = html;
    this.file = file;
    this.rawContent = [];

    this.parseRawDirectives();
    this.parseEachDirectives();
    this.parseDataDisplays();
    this.parseIfElseDirectives();
    this.parseIfDirectives();
    this.parseJsonDirectives();

    await this.parseIncludeDirectives();
    await this.parseTokenDirectives();

    this.parseMethodDirectives();
    this.parseViteDirectives();

    this.restoreRawContent();

    return this.html;
  }
}
