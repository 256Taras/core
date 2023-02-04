import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import typescript from 'typescript';
import { Authenticator } from '../auth/authenticator.service.js';
import { Gate } from '../auth/gate.class.js';
import { Configurator } from '../configurator/configurator.service.js';
import * as constants from '../constants.js';
import { currentUrl } from '../http/functions/current-url.function.js';
import { nonce } from '../http/functions/nonce.function.js';
import { oldInput } from '../http/functions/old-input.function.js';
import { previousUrl } from '../http/functions/previous-url.function.js';
import { routeUrl } from '../http/functions/route-url.function.js';
import { Request } from '../http/request.service.js';
import { Service } from '../injector/decorators/service.decorator.js';
import { inject } from '../injector/functions/inject.function.js';
import { flash } from '../session/functions/flash.function.js';
import { session } from '../session/functions/session.function.js';
import { trans } from '../translator/functions/trans.function.js';
import { csrfToken } from '../utils/functions/csrf-token.function.js';
import { env } from '../utils/functions/env.function.js';
import { range } from '../utils/functions/range.function.js';
import { readJson } from '../utils/functions/read-json.function.js';
import { Constructor } from '../utils/interfaces/constructor.interface.js';
import { TemplateDirectiveDefinition } from './interfaces/template-directive-definition.interface.js';

@Service()
export class TemplateCompiler {
  private data: Record<string, unknown> = {};

  private directives: TemplateDirectiveDefinition[] = [];

  private file?: string;

  private html: string;

  private readonly functions = {
    csrfToken,
    currentUrl,
    env,
    flash,
    inject,
    nonce,
    oldInput,
    previousUrl,
    range,
    routeUrl,
    session,
    trans,
  };

  private rawContent: string[] = [];

  public static stacks = new Map<string, string[]>();

  constructor(
    private authenticator: Authenticator,
    private configurator: Configurator,
    private request: Request,
  ) {
    this.directives = [
      {
        name: 'auth',
        type: 'block',
        render: (content: string) => {
          return this.authenticator.isAuthentcated() ? content : '';
        },
      },
      {
        name: 'can',
        type: 'block',
        render: (
          content: string,
          action: string,
          gate: Constructor<Gate>,
          subject: unknown,
        ) => {
          const isAuthorized = new gate().allows(action, subject);

          return isAuthorized ? content : '';
        },
      },
      {
        name: 'cannot',
        type: 'block',
        render: (
          content: string,
          action: string,
          gate: Constructor<Gate>,
          subject: unknown,
        ) => {
          const isAuthorized = new gate().allows(action, subject);

          return isAuthorized ? '' : content;
        },
      },
      {
        name: 'csrfToken',
        type: 'single',
        render: () => {
          return `<input type="hidden" name="_csrfToken" value="${csrfToken()}">`;
        },
      },
      {
        name: 'dev',
        type: 'block',
        render: (content: string) => {
          const isDevelopment =
            this.configurator.entries?.development ?? env<boolean>('DEVELOPMENT');

          return isDevelopment ? content : '';
        },
      },
      {
        name: 'error',
        type: 'single',
        render: (fieldName: string, customMessage?: string) => {
          const errors = flash<Record<string, string>>('errors') ?? {};

          if (fieldName in errors) {
            const error = customMessage ?? errors[fieldName][0];

            return error;
          }
        },
      },
      {
        name: 'errorBlock',
        type: 'block',
        render: (content: string, fieldName: string) => {
          const errors = flash<Record<string, string>>('errors') ?? {};

          if (fieldName in errors) {
            return content;
          }
        },
      },
      {
        name: 'guest',
        type: 'block',
        render: (content: string) => {
          return this.authenticator.isAuthentcated() ? '' : content;
        },
      },
      {
        name: 'hotReload',
        type: 'single',
        render: () => {
          const isDevelopment =
            this.configurator.entries?.development ?? env<boolean>('DEVELOPMENT');

          return isDevelopment
            ? `
            <script nonce="${nonce()}">
              const ws = new WebSocket('ws://localhost:6173');

              ws.onmessage = () => window.location.reload();
              ws.onclose = () => console.log('[northle] Hot reload disconnected');
            </script>
          `
            : '';
        },
      },
      {
        name: 'json',
        type: 'single',
        render: (data: object, prettyPrint?: boolean) => {
          return JSON.stringify(data, undefined, prettyPrint ? 2 : 0);
        },
      },
      {
        name: 'method',
        type: 'single',
        render: (method: string) => {
          method = method.toUpperCase();

          return `<input type="hidden" name="_method" value="${method}">`;
        },
      },
      {
        name: 'prod',
        type: 'block',
        render: (content: string) => {
          const isDevelopment =
            this.configurator.entries?.development ?? env<boolean>('DEVELOPMENT');

          return isDevelopment ? '' : content;
        },
      },
      {
        name: 'push',
        type: 'block',
        render: (content: string, stack: string) => {
          const { stacks } = this.constructor as unknown as {
            stacks: Map<string, string[]>;
          };

          stacks.set(
            stack,
            stacks.has(stack) ? [...stacks.get(stack)!, content] : [content],
          );

          return '';
        },
      },
      {
        name: 'include',
        type: 'single',
        render: async (partial: string) => {
          const file = `${
            this.file ? `${this.file}/..` : 'dist/app/views'
          }/${partial}.html`;

          if (!existsSync(file)) {
            throw new Error(`View partial '${partial}' does not exist`, {
              cause: new Error(`Create '${partial}' view partial file`),
            });
          }

          const compiler = inject(TemplateCompiler, { freshInstance: true });

          const fileContent = await readFile(file, 'utf8');
          const compiledPartial = await compiler.compile(fileContent, this.data);

          return compiledPartial;
        },
      },
      {
        name: 'stack',
        type: 'single',
        render: (stackName: string) => {
          const { stacks } = this.constructor as unknown as {
            stacks: Map<string, string[]>;
          };

          const stackedContent = stacks.get(stackName) ?? [];

          return stackedContent.join('');
        },
      },
      {
        name: 'vite',
        type: 'single',
        render: (fileEntries: string | string[]) => {
          let output = '';
          let usesReactRefresh = false;

          if (!Array.isArray(fileEntries)) {
            fileEntries = [fileEntries];
          }

          fileEntries.map((fileEntry) => {
            const fileExtension = fileEntry.split('.').pop() ?? 'js';

            if (
              this.configurator.entries?.development ??
              env<boolean>('DEVELOPMENT')
            ) {
              output = `<script type="module" src="http://localhost:5173/app/${fileEntry}"></script>`;

              if (['jsx', 'tsx'].includes(fileExtension)) {
                usesReactRefresh = true;
              }
            } else {
              (async () => {
                const manifestPath = 'public/manifest.json';

                if (!existsSync(manifestPath)) {
                  throw new Error('Vite manifest file not found', {
                    cause: new Error('Run vite build'),
                  });
                }

                const manifest = await readJson(manifestPath);

                const data = manifest[`app/${fileEntry}`];

                output = `
                  ${
                    data.css
                      ? `<link rel="stylesheet" href="/${
                          data.css
                        }" nonce="${nonce()}">`
                      : ''
                  }
        
                  <script type="module" src="/${
                    data.file
                  }" nonce="${nonce()}"></script>
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

          return output;
        },
      },
      ...(this.configurator.entries?.templates?.directives ?? []),
    ];
  }

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

  private parseDataInterpolations(): void {
    const matches = this.html.matchAll(/\{\{(@?)(.*?)\}\}/g) ?? [];

    for (const match of matches) {
      const value = match[2].trim();

      const transpiledJs = typescript
        .transpileModule(value, {
          compilerOptions: {
            module: typescript.ModuleKind.ESNext,
            target: typescript.ScriptTarget.ESNext,
          },
        })
        .outputText.replaceAll(/;/gm, '');

      const renderFunction = this.getRenderFunction(
        `return ${
          match[1] === '@' ? true : false
        } ? String(${transpiledJs}) : String(${transpiledJs}).replace(/[&<>'"]/g, (char) => ({
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
          typescript.transpileModule(value, {
            compilerOptions: {
              module: typescript.ModuleKind.ESNext,
              target: typescript.ScriptTarget.ESNext,
            },
          }).outputText
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

  private parseIfDirectives(): void {
    const matches =
      this.html.matchAll(/\[if ?(.*?)\](\n|\r\n*?)?((.|\n|\r\n)*?)\[\/if\]/gm) ?? [];

    for (const match of matches) {
      const value = match[1];

      const renderFunction = this.getRenderFunction(
        `return ${
          typescript.transpileModule(value, {
            compilerOptions: {
              module: typescript.ModuleKind.ESNext,
              target: typescript.ScriptTarget.ESNext,
            },
          }).outputText
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
          typescript.transpileModule(value, {
            compilerOptions: {
              module: typescript.ModuleKind.ESNext,
              target: typescript.ScriptTarget.ESNext,
            },
          }).outputText
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

  private parseSwitchDirectives(): void {
    const matches =
      this.html.matchAll(
        /\[switch ?(.*?)\](\n|\r\n*?)?((.|\n|\r\n)*?)\[\/switch\]/gm,
      ) ?? [];

    for (const match of matches) {
      const renderFunction = this.getRenderFunction(
        `return ${
          typescript.transpileModule(match[1], {
            compilerOptions: {
              module: typescript.ModuleKind.ESNext,
              target: typescript.ScriptTarget.ESNext,
            },
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
            throw new Error('Switch directive can only have one default case', {
              cause: new Error('Remove the extra default case'),
            });
          }

          defaultCaseValue = caseMatch[4];

          continue;
        }

        const caseRenderFunction = this.getRenderFunction(
          `return ${
            typescript.transpileModule(caseMatch[2], {
              compilerOptions: {
                module: typescript.ModuleKind.ESNext,
                target: typescript.ScriptTarget.ESNext,
              },
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

  public async compile(
    html: string,
    data: Record<string, unknown> = {},
    file?: string,
  ): Promise<string> {
    this.data = data;
    this.html = html;
    this.file = file;
    this.rawContent = [];

    this.parseRawDirectives();
    this.removeComments();

    await this.parseEachDirectives();

    this.parseIfElseDirectives();
    this.parseIfDirectives();
    this.parseDataInterpolations();
    this.parseSwitchDirectives();

    await Promise.all(
      this.directives.map(async (directive) => {
        const pattern =
          directive.type === 'single'
            ? new RegExp(`\\[${directive.name} *?(\\((.*?)\\))?\\]`, 'g')
            : new RegExp(
                `\\[${directive.name} *?(\\((.*?)\\))?\\](\n|\r\n*?)?((.|\n|\r\n)*?)\\[\\/${directive.name}\\]`,
                'gm',
              );

        const matches = this.html.matchAll(directive.pattern ?? pattern) ?? [];

        enum SegmentIndexes {
          Expression = 0,
          Arguments = 2,
          BlockContent = 4,
        }

        for (const match of matches) {
          const hasArguments = match[1];

          const argumentsRenderFunction = hasArguments
            ? this.getRenderFunction(
                `return ${
                  typescript.transpileModule(
                    `[${match[SegmentIndexes.Arguments]}]`,
                    {
                      compilerOptions: {
                        module: typescript.ModuleKind.ESNext,
                        target: typescript.ScriptTarget.ESNext,
                      },
                    },
                  ).outputText
                };`,
              )
            : () => [];

          const resolvedArguments = hasArguments
            ? argumentsRenderFunction<unknown[]>()
            : [];

          const result =
            directive.type === 'single'
              ? directive.render(...resolvedArguments)
              : directive.render(
                  match[SegmentIndexes.BlockContent],
                  ...resolvedArguments,
                );

          this.html = this.html.replace(
            match[SegmentIndexes.Expression],
            result instanceof Promise ? await result : result,
          );
        }
      }),
    );

    this.restoreRawContent();

    return this.html;
  }

  public registerDirective(directive: TemplateDirectiveDefinition): void {
    this.directives.push(directive);
  }
}
