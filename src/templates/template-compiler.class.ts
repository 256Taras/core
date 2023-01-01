import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { ModuleKind, transpileModule } from 'typescript';
import { Authenticator } from '../auth/authenticator.class';
import { Configurator } from '../configurator/configurator.class';
import * as constants from '../constants';
import { nonce } from '../http/functions/nonce.function';
import { oldInput } from '../http/functions/old-input.function';
import { Request } from '../http/request.class';
import { Service } from '../injector/decorators/service.decorator';
import { inject } from '../injector/functions/inject.function';
import { flash } from '../session/functions/flash.function';
import { session } from '../session/functions/session.function';
import { trans } from '../translator/functions/trans.function';
import { csrfToken } from '../utils/functions/csrf-token.function';
import { env } from '../utils/functions/env.function';
import { range } from '../utils/functions/range.function';
import { readJson } from '../utils/functions/read-json.function';

@Service()
export class TemplateCompiler {
  private data: Record<string, any> = {};

  private file?: string;

  private html: string;

  private readonly functions = {
    csrfToken,
    flash,
    inject,
    nonce,
    oldInput,
    range,
    session,
    trans,
  };

  private rawContent: string[] = [];

  public static stacks: Map<string, string[]> = new Map<string, string[]>();

  constructor(
    private authenticator: Authenticator,
    private configurator: Configurator,
    private request: Request,
  ) {}

  private getRenderFunction(body: string, variables: Record<string, unknown> = {}) {
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

  private async parseEachDirectives(): Promise<void> {
    const matches =
      this.html.matchAll(
        /\[each *?\((.*?) (in|of) (.*)\)\](\n|\r\n)?((.*?|\s*?)*?)\[\/each\]/gm,
      ) ?? [];

    for (const match of matches) {
      const value = match[3];
      const renderFunction = this.getRenderFunction(
        `return ${
          transpileModule(value, { compilerOptions: { module: ModuleKind.ESNext } })
            .outputText
        };`,
      );

      const variableName = match[1];

      let iterable = renderFunction<unknown[]>();
      let result = '';
      let iterator = 0;

      if (typeof iterable === 'number') {
        iterable = range(iterable);
      }

      await Promise.all(
        Object.entries(iterable).map(async ([key, item]) => {
          if (Object.hasOwn(iterable, key)) {
            const index = JSON.parse(`"${key}"`);

            let content = match[5];

            const scopeVariables = {
              [variableName]: item,
              $even: index % 2 === 0,
              $first: index === 0,
              $index: iterator,
              $key: index,
              $last: index === Object.keys(iterable).length - 1,
              $odd: index % 2 === 1,
            };

            const compiler = inject(TemplateCompiler, { freshInstance: true });

            content = await compiler.compile(content, {
              ...this.data,
              ...scopeVariables,
            });

            result += content;
            iterator += 1;
          }
        }),
      );

      this.html = this.html.replace(match[0], result);
    }
  }

  private parseErrorDirectives(): void {
    const matches =
      this.html.matchAll(
        /\[error *?\((.*?)\)\]((\n|\r\n*?)?((.|\n|\r\n)*?)\[\/error\])?/g,
      ) ?? [];

    for (const match of matches) {
      const value = match[1];
      const renderFunction = this.getRenderFunction(
        `return ${
          transpileModule(value, { compilerOptions: { module: ModuleKind.ESNext } })
            .outputText
        };`,
      );
      const fieldName = renderFunction<string>();

      const errors = flash<Record<string, string>>('errors') ?? {};

      if (fieldName in errors) {
        const error = match[2] ? match[4] : errors[fieldName][0];

        this.html = this.html.replace(match[0], error);

        continue;
      }

      this.html = this.html.replace(match[0], '');
    }
  }

  private parseAuthDirectives(): void {
    const matches =
      this.html.matchAll(/\[auth\](\n|\r\n*?)?((.|\n|\r\n)*?)\[\/auth\]/gm) ?? [];

    for (const match of matches) {
      const authenticated = this.authenticator.check();

      this.html = this.html.replace(match[0], authenticated ? match[2] : '');
    }
  }

  private parseGuestDirectives(): void {
    const matches =
      this.html.matchAll(/\[guest\](\n|\r\n*?)?((.|\n|\r\n)*?)\[\/guest\]/gm) ?? [];

    for (const match of matches) {
      const authenticated = this.authenticator.check();

      this.html = this.html.replace(match[0], authenticated ? '' : match[2]);
    }
  }

  private parseIfDirectives(): void {
    const matches =
      this.html.matchAll(/\[if ?(.*?)\](\n|\r\n*?)?((.|\n|\r\n)*?)\[\/if\]/gm) ?? [];

    for (const match of matches) {
      const value = match[1];
      const renderFunction = this.getRenderFunction(
        `return ${
          transpileModule(value, { compilerOptions: { module: ModuleKind.ESNext } })
            .outputText
        };`,
      );

      const condition = renderFunction<boolean>();

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
      const renderFunction = this.getRenderFunction(
        `return ${
          transpileModule(value, { compilerOptions: { module: ModuleKind.ESNext } })
            .outputText
        };`,
      );

      const condition = renderFunction<boolean>();

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
      const renderFunction = this.getRenderFunction(
        `return ${
          transpileModule(value, { compilerOptions: { module: ModuleKind.ESNext } })
            .outputText
        };`,
      );

      const partial = renderFunction<string>();

      const file = `${
        this.file ? `${this.file}/..` : 'dist/app/views'
      }/${partial}.html`;

      if (!existsSync(file)) {
        throw new Error(`Template partial '${partial}' does not exist`);
      }

      const compiler = inject(TemplateCompiler, { freshInstance: true });

      const fileContent = await readFile(file, 'utf-8');
      const compiledPartial = await compiler.compile(fileContent, this.data);

      this.html = this.html.replace(match[0], compiledPartial);
    }
  }

  private parseJsonDirectives(): void {
    const matches =
      this.html.matchAll(/\[json *?\((.*?),? *?(true|false)?\)\]/g) ?? [];

    for (const match of matches) {
      const value = match[1];
      const prettyPrint = match[2] ?? 'false';

      const renderFunction = this.getRenderFunction(
        `return ${
          transpileModule(value, { compilerOptions: { module: ModuleKind.ESNext } })
            .outputText
        };`,
      );
      const printRenderFunction = this.getRenderFunction(
        `return ${
          transpileModule(prettyPrint, {
            compilerOptions: { module: ModuleKind.ESNext },
          }).outputText
        };`,
      );

      const json = JSON.stringify(
        renderFunction<object>(),
        undefined,
        printRenderFunction<boolean>() ? 2 : 0,
      );

      this.html = this.html.replace(match[0], json);
    }
  }

  private parseMethodDirectives(): void {
    const matches = this.html.matchAll(/\[method *?\((.*?)\)\]/g) ?? [];

    for (const match of matches) {
      const value = match[1];
      const renderFunction = this.getRenderFunction(
        `return ${
          transpileModule(value, { compilerOptions: { module: ModuleKind.ESNext } })
            .outputText
        };`,
      );

      this.html = this.html.replace(
        match[0],
        `<input type="hidden" name="_method" value="${renderFunction<string>().toUpperCase()}">`,
      );
    }
  }

  private parsePushDirectives(): void {
    const matches =
      this.html.matchAll(/\[push ?(.*?)\](\n|\r\n*?)?((.|\n|\r\n)*?)\[\/push\]/gm) ??
      [];

    for (const match of matches) {
      const value = match[1];
      const renderFunction = this.getRenderFunction(
        `return ${
          transpileModule(value, { compilerOptions: { module: ModuleKind.ESNext } })
            .outputText
        };`,
      );

      const stack = renderFunction<string>();

      const { stacks } = this.constructor as unknown as {
        stacks: Map<string, string[]>;
      };

      stacks.set(
        stack,
        stacks.has(stack) ? [...stacks.get(stack)!, match[3]] : [match[3]],
      );

      this.html = this.html.replace(match[0], '');
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

  private parseStackDirectives(): void {
    const matches = this.html.matchAll(/\[stack *?\((.*?)\)\]/g) ?? [];

    for (const match of matches) {
      const value = match[1];
      const renderFunction = this.getRenderFunction(
        `return ${
          transpileModule(value, { compilerOptions: { module: ModuleKind.ESNext } })
            .outputText
        };`,
      );

      const { stacks } = this.constructor as unknown as {
        stacks: Map<string, string[]>;
      };

      const content = stacks.get(renderFunction<string>()) ?? [];

      this.html = this.html.replace(match[0], content.join(''));
    }
  }

  private parseSwitchDirectives(): void {
    const matches =
      this.html.matchAll(
        /\[switch ?(.*?)\](\n|\r\n*?)?((.|\n|\r\n)*?)\[\/switch\]/gm,
      ) ?? [];

    for (const match of matches) {
      const renderFunction = this.getRenderFunction(
        `return ${
          transpileModule(match[1], {
            compilerOptions: { module: ModuleKind.ESNext },
          }).outputText
        };`,
      );
      const switchCondition = renderFunction<unknown>();

      const casesString = match[3];
      const cases = new Map<unknown, string>();

      let defaultCaseValue: string | null = null;

      const caseMatches = casesString.matchAll(
        /\[(case|default) ?(.*?)\](\n|\r\n*?)?((.|\n|\r\n)*?)\[\/(case|default)\]/gm,
      );

      for (const caseMatch of caseMatches) {
        if (caseMatch[1] === 'default') {
          if (defaultCaseValue) {
            throw new Error('Switch statement can only have one default case');
          }

          defaultCaseValue = caseMatch[4];

          continue;
        }

        const caseRenderFunction = this.getRenderFunction(
          `return ${
            transpileModule(caseMatch[2], {
              compilerOptions: { module: ModuleKind.ESNext },
            }).outputText
          };`,
        );

        cases.set(caseRenderFunction<unknown>(), caseMatch[4]);
      }

      let matchesOneCase = false;

      cases.forEach((value, key) => {
        if (key === switchCondition) {
          this.html = this.html.replace(match[0], value);

          matchesOneCase = true;

          return;
        }
      });

      if (!matchesOneCase && defaultCaseValue) {
        this.html = this.html.replace(match[0], defaultCaseValue);

        return;
      }

      this.html = this.html.replace(match[0], '');
    }
  }

  private parseViteDirectives(): void {
    const matches = this.html.matchAll(/\[vite *?\((.*?)\)\]/gm) ?? [];

    for (const match of matches) {
      const value = match[1];
      const renderFunction = this.getRenderFunction(
        `return ${
          transpileModule(value, { compilerOptions: { module: ModuleKind.ESNext } })
            .outputText
        };`,
      );

      let fileEntries = renderFunction<string | string[]>();
      let output = '';
      let usesReactRefresh = false;

      if (!Array.isArray(fileEntries)) {
        fileEntries = [fileEntries];
      }

      fileEntries.map((fileEntry) => {
        const fileExtension = fileEntry.split('.').pop() ?? 'js';

        if (this.configurator.entries.development ?? env<boolean>('DEVELOPMENT')) {
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
              ${
                data.css
                  ? `<link rel="stylesheet" href="/${data.css}" nonce="${nonce()}">`
                  : ''
              }
    
              <script type="module" src="/${data.file}" nonce="${nonce()}"></script>
            `;
          })();
        }
      });

      if (usesReactRefresh) {
        output = `
          <script type="module" nonce="${nonce()}">
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

  private removeComments(): void {
    const matches = this.html.matchAll(/\{\{(@?)--(.*?)--\}\}/g) ?? [];

    for (const match of matches) {
      this.html = this.html.replace(match[0], '');
    }
  }

  private restoreRawContent(): void {
    const matches = this.html.matchAll(/\$_raw([0-9]+)/g) ?? [];

    for (const match of matches) {
      const index = parseInt(match[1]);

      this.html = this.html.replace(match[0], this.rawContent[index]);
    }
  }

  private parseCsrfTokenDirectives(): void {
    const matches = this.html.matchAll(/\[(csrfToken|csrf)\]/g) ?? [];
    const token = csrfToken();

    for (const match of matches) {
      this.html = this.html.replace(
        match[0],
        `<input type="hidden" name="_csrf" value="${token}">`,
      );
    }
  }

  public async compile(
    html: string,
    data: Record<string, any> = {},
    file?: string,
  ): Promise<string> {
    this.data = data;
    this.html = html;
    this.file = file;
    this.rawContent = [];

    this.parseRawDirectives();
    this.removeComments();

    await this.parseEachDirectives();

    this.parseDataDisplays();
    this.parseIfElseDirectives();
    this.parseIfDirectives();
    this.parseSwitchDirectives();
    this.parseJsonDirectives();
    this.parseErrorDirectives();
    this.parseAuthDirectives();
    this.parseGuestDirectives();
    this.parsePushDirectives();
    this.parseCsrfTokenDirectives();

    await this.parseIncludeDirectives();

    this.parseMethodDirectives();
    this.parseStackDirectives();
    this.parseViteDirectives();

    this.restoreRawContent();

    return this.html;
  }
}
