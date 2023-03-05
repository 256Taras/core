import { Reflection as Reflect } from '@abraham/reflection';
import cookieMiddleware, { FastifyCookieOptions } from '@fastify/cookie';
import corsMiddleware, { FastifyCorsOptions } from '@fastify/cors';
import formMiddleware from '@fastify/formbody';
import helmetMiddleware, { FastifyHelmetOptions } from '@fastify/helmet';
import multipartMiddleware, { FastifyMultipartOptions } from '@fastify/multipart';
import chalk from 'chalk';
import { watch } from 'chokidar';
import fastify from 'fastify';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Configurator } from '../configurator/configurator.service.js';
import { env } from '../configurator/functions/env.function.js';
import { Encrypter } from '../encrypter/encrypter.service.js';
import { createErrorTip } from '../handler/functions/create-error-tip.function.js';
import { Handler } from '../handler/handler.service.js';
import { MIME_TYPES } from '../http/constants.js';
import { StatusCode } from '../http/enums/status-code.enum.js';
import { HttpError } from '../http/http-error.class.js';
import { Request } from '../http/request.service.js';
import { Response } from '../http/response.service.js';
import { Service } from '../injector/decorators/service.decorator.js';
import { inject } from '../injector/functions/inject.function.js';
import {
  LOGGER_COLOR_BLUE,
  LOGGER_COLOR_GREEN,
  LOGGER_COLOR_ORANGE,
  LOGGER_COLOR_RED,
} from '../logger/constants.js';
import { Logger } from '../logger/logger.service.js';
import { Router } from '../router/router.service.js';
import { Session } from '../session/session.service.js';
import { Authorizer } from '../socket/interfaces/authorizer.interface.js';
import { SocketEmitter } from '../socket/socket-emitter.service.js';
import { Translator } from '../translator/translator.service.js';
import { readJson } from '../utils/functions/read-json.function.js';
import { Constructor } from '../utils/interfaces/constructor.interface.js';
import { Integer } from '../utils/types/integer.type.js';
import { ServerOptions } from './interfaces/server-options.interface.js';

@Service()
export class Server {
  private readonly configurator = inject(Configurator);

  private defaultHost = 'localhost';

  private readonly defaultPort: Integer = 7000;

  private readonly defaultWebSocketPort: Integer = 7070;

  private development = false;

  private readonly encrypter = inject(Encrypter);

  private readonly handler = inject(Handler);

  private instance = fastify();

  private readonly logger = inject(Logger);

  private modules: Constructor[] = [];

  private readonly request = inject(Request);

  private readonly response = inject(Response);

  private readonly router = inject(Router);

  private readonly session = inject(Session);

  private readonly socketEmitter = inject(SocketEmitter);

  private readonly tempFilePath = `${tmpdir()}/northle/server/server.tmp`;

  private readonly translator = inject(Translator);

  private handleCsrfToken(): void {
    if (!this.session.has('_csrfToken')) {
      const token = this.encrypter.randomBytes(16);

      this.session.set('_csrfToken', token);
      this.response.cookie('csrfToken', token);
    }

    if (this.request.isFormRequest()) {
      const token =
        this.request.input('_csrf') ??
        this.request.input('_csrfToken') ??
        this.request.header('X-CSRF-TOKEN') ??
        this.request.header('X-XSRF-TOKEN');

      if (!token || token !== this.session.get('_csrfToken')) {
        throw new HttpError(StatusCode.InvalidToken);
      }
    }
  }

  private registerStaticFileServer(): void {
    if (this.development) {
      this.instance.get('/$northle:error.png', async (_request, response) => {
        const file = await readFile(
          `${fileURLToPath(import.meta.url)}/../../../assets/error.png`,
        );

        response.type('image/png');

        return file;
      });
    }

    this.instance.get(
      '/:file.:extension(^[A-Za-z0-9]+)',
      async (request, response) => {
        const params = request.params as Record<string, string>;
        const filePath = `public/${params.file}.${params.extension}`;

        if (!existsSync(filePath)) {
          response.callNotFound();

          return;
        }

        const file = await readFile(filePath);

        response.type(MIME_TYPES[params.extension]);

        return file;
      },
    );
  }

  private async registerMiddleware(): Promise<void> {
    const cspOptions = this.configurator.entries.contentSecurityPolicy;

    const helmetOptions: FastifyHelmetOptions = {
      contentSecurityPolicy:
        typeof cspOptions === 'boolean'
          ? cspOptions
          : {
              directives: {
                ...helmetMiddleware.contentSecurityPolicy.getDefaultDirectives(),
                'connect-src': [`'self'`, 'http://localhost:*', 'ws://localhost:*'],
                'default-src': [
                  `'self'`,
                  `'unsafe-inline'`,
                  'http://localhost:*',
                  'ws://localhost:*',
                ],
                'script-src': [
                  `'self'`,
                  `'unsafe-inline'`,
                  'http://localhost:*',
                  'ws://localhost:*',
                ],
                'script-src-attr': `'unsafe-inline'`,
                'style-src': [`'self'`, `'unsafe-inline'`, 'http://localhost:*'],
              },
              ...((this.configurator.entries.contentSecurityPolicy ?? {}) as Record<
                string,
                unknown
              >),
            },
    };

    const corsOptions: FastifyCorsOptions = this.configurator.entries.cors ?? {};

    const cookieOptions: FastifyCookieOptions = {
      secret: this.configurator.entries.crypto?.key ?? env<string>('ENCRYPT_KEY')!,
    };

    const multipartOptions: FastifyMultipartOptions = {
      addToBody: true,
      limits: {
        fieldSize:
          (this.configurator.entries.upload?.fieldLimit ??
            env<number>('UPLOAD_FIELD_LIMIT') ??
            10) *
          1024 *
          1024,
        fileSize:
          (this.configurator.entries.upload?.fileLimit ??
            env<number>('UPLOAD_FILE_LIMIT') ??
            100) *
          1024 *
          1024,
      },
    };

    await this.instance.register(helmetMiddleware, helmetOptions);
    await this.instance.register(cookieMiddleware, cookieOptions);
    await this.instance.register(corsMiddleware, corsOptions);
    await this.instance.register(formMiddleware);
    await this.instance.register(multipartMiddleware, multipartOptions);
  }

  private async setupDevelopmentEnvironment(): Promise<void> {
    const requiredNodeVersion = (
      await readJson(`${fileURLToPath(import.meta.url)}/../../../package.json`)
    ).engines.node;

    const satisfiesVersion = process.version
      .slice(1)
      .localeCompare(requiredNodeVersion.slice(2), undefined, {
        numeric: true,
        sensitivity: 'base',
      });

    if (satisfiesVersion === -1) {
      this.logger.warn(
        `Northle requires Node.js v${requiredNodeVersion.slice(
          2,
        )} or greater [update on https://nodejs.org]`,
      );

      process.exit(1);
    }

    if (!existsSync(dirname(this.tempFilePath))) {
      await mkdir(dirname(this.tempFilePath), {
        recursive: true,
      });
    }

    await writeFile(this.tempFilePath, 'Northle server is running...');
  }

  public async $setup(options: ServerOptions): Promise<this> {
    try {
      this.configurator.$setup(options.config ?? {});

      this.development =
        this.configurator.entries.development ??
        env<boolean>('DEVELOPMENT') ??
        false;

      process.on('uncaughtException', async (error) => {
        await this.handler.handleFatalError(error);
      });

      process.on('unhandledRejection', async (error: Error) => {
        await this.handler.handleFatalError(error);
      });

      const envFile = this.configurator.entries.envFile ?? '.env';

      if (!existsSync(envFile)) {
        throw new Error(
          'Environment configuration file not found',
          createErrorTip('Run *npm run env:prepare* script'),
        );
      }

      await this.configurator.loadEnvironment(envFile);

      if (!(this.configurator.entries.crypto?.key ?? env<string>('ENCRYPT_KEY'))) {
        throw new Error(
          'Encryption key is missing in environment configuration',
          createErrorTip('Run *npm run env:prepare* script'),
        );
      }

      const channels = [];

      options.modules.map((module: Constructor) => {
        const instance = inject(module);

        const controllers =
          Reflect.getMetadata<Constructor[]>('controllers', module) ?? [];

        this.router.$registerControllers(controllers);

        const socketChannels =
          Reflect.getMetadata<(Constructor & Authorizer)[]>(
            'socketChannels',
            module,
          ) ?? [];

        this.modules.push(instance);

        this.socketEmitter.$registerChannels(socketChannels);

        channels.push(...socketChannels);
      });

      if (this.development) {
        this.socketEmitter.createChannel('$northle', '$northleSocket');
      }

      this.socketEmitter.$setup({
        ...(channels.length
          ? {
              main:
                this.configurator.entries.websocket?.port ??
                env<Integer>('WEBSOCKET_PORT') ??
                this.defaultWebSocketPort,
            }
          : {}),
        ...(this.development
          ? {
              $northleSocket: 6173,
            }
          : {}),
      });

      if (this.development) {
        const viewsWatcher = watch('dist/**/*.html');

        viewsWatcher.on('all', () => {
          this.socketEmitter.emit('hotReload', '$northle');
        });
      }

      await this.translator.$setup(this.configurator.entries.locale ?? 'en');

      this.translator.setRequestLocale(this.configurator.entries.locale ?? 'en');
    } catch (error) {
      await this.handler.handleError(error as Error);
    }

    return this;
  }

  public async start(
    port = this.configurator.entries.port ??
      env<Integer>('PORT') ??
      this.defaultPort,
    host = this.configurator.entries.host ?? env<string>('HOST') ?? this.defaultHost,
  ): Promise<void> {
    try {
      let startTime: [number, number];

      await this.registerMiddleware();

      this.instance.addHook('onRequest', async (request, response) => {
        if (!this.request.isFileRequest()) {
          this.session.$setRequest(request);
          this.session.$setResponse(response);
        }

        this.request.$setInstance(request);
        this.response.$setInstance(response);

        this.request.$generateNonce();

        this.response.terminate(false);

        if (!this.request.isFileRequest()) {
          await this.session.$setup();

          this.session.increment('_requestId', 1, 0);

          this.session.set(`_lastMinuteRequests:${this.request.url()}`, [
            ...(
              this.session.get<Integer[]>(
                `_lastMinuteRequests:${this.request.url()}`,
              ) ?? []
            ).filter((timestamp) => {
              const currentDate = new Date();
              const timestampDate = new Date(timestamp);

              return currentDate.getMinutes() === timestampDate.getMinutes();
            }),
          ]);
        }

        startTime = process.hrtime();
      });

      this.instance.addHook('preValidation', async () => {
        if (!this.request.isFileRequest()) {
          this.handleCsrfToken();

          if (this.request.isFormRequest()) {
            this.session.flash<Record<string, unknown>>(
              'oldInput',
              this.request.body,
            );
          }
        }

        this.response.header(
          'content-security-policy',
          (
            this.response.header('content-security-policy') as string | null
          )?.replaceAll(
            /(script|style)-src /g,
            `$1-src 'nonce-${this.request.nonce()}' `,
          ),
        );
      });

      this.instance.addHook('onResponse', async (request, response) => {
        if (!this.request.isFileRequest() && !this.request.isFormRequest()) {
          this.session.set('_previousLocation', request.url);
        }

        await this.session.$saveSessionData();

        const endTime = process.hrtime(startTime);

        const elapsedTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(1);
        const elapsedTimeFormatted = chalk.gray(
          `${elapsedTime} ms`.padStart(9, ' '),
        );

        const { statusCode } = response;

        let statusColor = chalk.hex(LOGGER_COLOR_GREEN);

        switch (true) {
          case statusCode >= 100 && statusCode < 200:
            statusColor = chalk.hex(LOGGER_COLOR_BLUE);

            break;

          case statusCode >= 200 && statusCode < 400:
            statusColor = chalk.hex(LOGGER_COLOR_GREEN);

            break;

          case statusCode >= 400 && statusCode < 500:
            statusColor = chalk.hex(LOGGER_COLOR_ORANGE);

            break;

          case statusCode >= 500 && statusCode < 600:
            statusColor = chalk.hex(LOGGER_COLOR_RED);

            break;
        }

        this.logger.log(
          `${chalk.gray(
            `[${statusColor(response.statusCode)}]`,
          )} ${this.request.method()} ${request.url}`,
          'request',
          elapsedTimeFormatted,
        );
      });

      this.instance.setErrorHandler(async (error) => {
        await this.handler.handleError(error);
      });

      this.router.registerRoutes(this.instance);

      this.registerStaticFileServer();

      this.instance.setNotFoundHandler(async () => {
        throw new HttpError(StatusCode.NotFound);
      });

      await this.instance.listen({ port, host });

      if (this.development) {
        await this.setupDevelopmentEnvironment();
      }
    } catch (error) {
      await this.handler.handleError(error as Error);
    }
  }
}
