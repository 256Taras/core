import { Reflection as Reflect } from '@abraham/reflection';
import cookieMiddleware, { FastifyCookieOptions } from '@fastify/cookie';
import corsMiddleware, { FastifyCorsOptions } from '@fastify/cors';
import formMiddleware from '@fastify/formbody';
import helmetMiddleware, { FastifyHelmetOptions } from '@fastify/helmet';
import multipartMiddleware, { FastifyMultipartOptions } from '@fastify/multipart';
import staticServerMiddleware, { FastifyStaticOptions } from '@fastify/static';
import chalk from 'chalk';
import { config as configDotenv } from 'dotenv';
import fastify from 'fastify';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Configurator } from '../configurator/configurator.class';
import { Encrypter } from '../crypto/encrypter.class';
import { Handler } from '../handler/handler.class';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { inject } from '../injector/functions/inject.function';
import { Logger } from '../logger/logger.class';
import { Router } from '../router/router.class';
import { Session } from '../session/session.class';
import { Translator } from '../translator/translator.class';
import { env } from '../utils/functions/env.function';
import { readJson } from '../utils/functions/read-json.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Integer } from '../utils/types/integer.type';
import { Authorizer } from '../websocket/interfaces/authorizer.interface';
import { SocketEmitter } from '../websocket/socket-emitter.class';
import { ServerOptions } from './interfaces/server-options.interface';

@Service()
export class Server {
  private defaultHost = 'localhost';

  private defaultPort: Integer = 8000;

  private instance = fastify();

  private modules: Constructor[] = [];

  private tempFilePath = `${tmpdir()}/northle/server/server.txt`;

  constructor(
    private configurator: Configurator,
    private encrypter: Encrypter,
    private handler: Handler,
    private logger: Logger,
    private request: Request,
    private response: Response,
    private router: Router,
    private session: Session,
    private socketEmitter: SocketEmitter,
    private translator: Translator,
  ) {}

  private handleCsrfToken(): void {
    if (!this.session.has('_csrfToken')) {
      const token = this.encrypter.randomBytes(16);

      this.session.set('_csrfToken', token);
      this.response.cookie('csrfToken', token);
    }

    if (this.request.isFormRequest()) {
      const token =
        this.request.input('_csrf') ??
        this.request.input('_token') ??
        this.request.header('X-CSRF-TOKEN') ??
        this.request.header('X-XSRF-TOKEN');

      if (!token || token !== this.session.get('_csrfToken')) {
        this.handler.handleInvalidToken();
      }
    }
  }

  private registerHandlers(): void {
    this.instance.setErrorHandler(async (error) => {
      await this.handler.handleError(error);
    });

    this.instance.setNotFoundHandler(() => {
      this.handler.handleNotFound();
    });
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
                'connect-src': [`'self'`, `http://localhost:*`, 'ws://localhost:*'],
                'default-src': [
                  `'self'`,
                  `'unsafe-inline'`,
                  'http://localhost:*',
                  'ws://localhost:*',
                ],
                'script-src': [
                  `'self'`,
                  `'unsafe-inline'`,
                  `http://localhost:*`,
                  'ws://localhost:*',
                ],
                'script-src-attr': `'unsafe-inline'`,
                'style-src': [`'self'`, `'unsafe-inline'`, `http://localhost:*`],
              },
              ...((this.configurator.entries.contentSecurityPolicy ?? {}) as Record<
                string,
                unknown
              >),
            },
    };

    const corsOptions: FastifyCorsOptions = this.configurator.entries.cors ?? {};

    const cookieOptions: FastifyCookieOptions = {
      secret:
        this.configurator.entries.crypto?.key ??
        env('ENCRYPT_KEY') ??
        this.encrypter.randomBytes(16),
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

    const staticServerOptions: FastifyStaticOptions = {
      root: path.resolve('public'),
    };

    await this.instance.register(helmetMiddleware, helmetOptions);
    await this.instance.register(corsMiddleware, corsOptions);
    await this.instance.register(cookieMiddleware, cookieOptions);
    await this.instance.register(formMiddleware);
    await this.instance.register(multipartMiddleware, multipartOptions);
    await this.instance.register(staticServerMiddleware, staticServerOptions);
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
        `Northle requires NodeJS v${requiredNodeVersion.slice(
          2,
        )} or greater [update on https://nodejs.org]`,
      );

      process.exit(1);
    }

    if (!existsSync(dirname(this.tempFilePath))) {
      await mkdir(dirname(this.tempFilePath), {
        recursive: true,
      });

      await writeFile(this.tempFilePath, 'Northle server is running...');
    }
  }

  public async $setup(options: ServerOptions): Promise<this> {
    try {
      this.configurator.$setup(options.config ?? {});

      process.on('uncaughtException', async (error) => {
        await this.handler.handleFatalError(error);
      });

      process.on('unhandledRejection', async (error: Error) => {
        await this.handler.handleFatalError(error);
      });

      const envFile = this.configurator.entries.env ?? '.env';

      if (!existsSync(envFile)) {
        const error = new Error('Environment configuration file not found');

        await this.handler.handleError(error as Error);
      }

      configDotenv({
        path: envFile,
      });

      if (!(this.configurator.entries.logger ?? true)) {
        this.logger.$disable();
      }

      const channels = [];

      options.modules.map((module: Constructor) => {
        const instance = inject(module);

        const socketChannels: (Constructor & Authorizer)[] =
          Reflect.getMetadata('socketChannels', module) ?? [];

        this.modules.push(instance);

        this.socketEmitter.registerChannels(socketChannels);

        channels.push(...socketChannels);
      });

      if (channels.length) {
        this.socketEmitter.$setup(this.instance.server);
      }

      await this.translator.$setup();

      this.translator.setLocale(this.configurator.entries.locale ?? 'en');
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

        await this.session.$writeSession();

        const endTime = process.hrtime(startTime);

        const elapsedTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(1);
        const timeFormatted = chalk.gray(`${elapsedTime} ms`.padStart(9, ' '));

        const status = response.statusCode;
        const red = this.logger.colorRed;
        const orange = this.logger.colorOrange;

        const statusMapping = {
          [String(status >= 100 && status < 200)]: chalk.blueBright(status),
          [String(status >= 200 && status < 400)]: chalk.green(status),
          [String(status >= 400 && status < 500)]: chalk.hex(orange)(status),
          [String(status >= 500 && status < 600)]: chalk.hex(red)(status),
        };

        const formattedStatus = statusMapping['true'] ?? status.toString();

        this.logger.log(
          `${chalk.bold(formattedStatus)} ${this.request.method()} ${request.url}`,
          'request',
          timeFormatted,
        );
      });

      this.router.registerRoutes(this.instance);
      this.registerHandlers();

      await this.instance.listen({ port, host });

      if (this.configurator.entries.development ?? env<boolean>('DEVELOPMENT')) {
        await this.setupDevelopmentEnvironment();
      }
    } catch (error) {
      await this.handler.handleError(error as Error);
    }
  }
}
