import { fileURLToPath } from 'node:url';
import { Configurator } from '../configurator/configurator.service.js';
import { env } from '../configurator/functions/env.function.js';
import { StatusCode } from '../http/enums/status-code.enum.js';
import { HttpError } from '../http/http-error.class.js';
import { Request } from '../http/request.service.js';
import { Response } from '../http/response.service.js';
import { Service } from '../injector/decorators/service.decorator.js';
import { Logger } from '../logger/logger.service.js';
import { Integer } from '../utils/types/integer.type.js';

@Service()
export class Handler {
  private currentCaller: string | null = null;

  private currentError: Error | null = null;

  private currentFile: string | null = null;

  private currentLine: Integer | null = null;

  private customHandlers = new Map<StatusCode, Function>();

  constructor(
    private configurator: Configurator,
    private logger: Logger,
    private request: Request,
    private response: Response,
  ) {}

  private async readErrorStack(): Promise<void> {
    const stack = this.currentError?.stack ?? 'Error\n    at <anonymous>:1:1';

    if (env<boolean>('DEVELOPER_MODE') ?? false) {
      console.log(stack);
    }

    const whereThrown = stack.split('\n')[1];

    const thrownAt = whereThrown?.slice(
      whereThrown.indexOf('at ') + 2,
      whereThrown.length,
    );
    const caller = thrownAt?.split('(')?.[0] ?? 'unknown';
    const fileMatch = thrownAt?.match(/\((.*?)\)/);

    let file = '';
    let line: Integer | null = +(fileMatch?.[1]?.match(/(.*):(.*):(.*)/)?.[2] ?? 1);

    if (file.includes('/node_modules') && file.includes('/core')) {
      file = '@northle/core package file';
      line = null;
    } else {
      try {
        file = fileMatch ? fileURLToPath(fileMatch[1]) : 'unknown';
      } catch {
        file = 'unknown';
      }

      file = `src/${
        file
          .replace(file.replace(/([^:]*:){2}/, ''), '')
          ?.slice(0, -1)
          ?.replaceAll('\\', '/')
          ?.split('src/')?.[1] ?? file
      }`;
    }

    this.currentCaller = caller;
    this.currentFile = file;
    this.currentLine = line;
  }

  public async handleError(error: Error): Promise<void> {
    if (error instanceof HttpError) {
      await this.response.abort(error.statusCode, error.message);

      return;
    }

    this.currentError = error;

    const statusCode = StatusCode.InternalServerError;

    if (this.customHandlers.has(statusCode)) {
      this.customHandlers.get(statusCode)?.(error);

      return;
    }

    await this.readErrorStack();

    const message = /(.*?) is not defined/.test(error.message)
      ? error.message
      : (error.message.charAt(0).toUpperCase() + error.message.slice(1)).replaceAll(
          /\n|\r\n/g,
          ' ',
        );

    this.logger.error(message);

    this.logger.sub('-----');

    if (this.currentFile) {
      this.logger.sub(`in file: ${this.currentFile}`);
    }

    if (this.currentLine && this.currentFile && this.currentFile !== 'unknown') {
      this.logger.sub(`in line: ${this.currentLine}`);
    }

    if (this.request.fullUrl()) {
      this.logger.sub(`on route: ${this.request.fullUrl()}`);
    }

    if (this.request.ip()) {
      this.logger.sub(`from IP: ${this.request.ip()}`);
    }

    if (
      !this.request.isAjaxRequest() &&
      (this.configurator.entries.development ?? env<boolean>('DEVELOPMENT'))
    ) {
      this.response.status(statusCode);

      await this.response.render(
        `${fileURLToPath(import.meta.url)}/../../../views/error`,
        {
          caller: this.currentCaller,
          error,
          file: this.currentFile,
          line: this.currentLine,
          message,
        },
      );

      return;
    }

    await this.response.abort(statusCode);
  }

  public async handleFatalError(error: Error): Promise<void> {
    if (error !== Object(error)) {
      return;
    }

    this.currentError = error;

    await this.readErrorStack();

    const message = error.message.charAt(0).toUpperCase() + error.message.slice(1);

    this.logger.error(message, 'fatal error');

    if (this.currentFile) {
      this.logger.sub(`File: ${this.currentFile} in line ${this.currentLine}`);
    }

    if (!(this.configurator.entries.development ?? env<boolean>('DEVELOPMENT'))) {
      process.exit(1);
    }

    this.logger.warn('In production mode process will exit on fatal errors');
  }

  public setCustomHandler(statusCode: StatusCode, callback: () => unknown): void {
    this.customHandlers.set(statusCode, callback);
  }
}
