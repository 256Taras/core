import cookieMiddleware from '@fastify/cookie';
import corsMiddleware from '@fastify/cors';
import csrfMiddleware from '@fastify/csrf-protection';
import helmetMiddleware from '@fastify/helmet';
import multipartMiddleware from '@fastify/multipart';
import sessionMiddleware from '@fastify/session';
import staticServerMiddleware from '@fastify/static';
import chalk from 'chalk';
import { config as configDotenv } from 'dotenv';
import fastify from 'fastify';
import { existsSync } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
import { runCommand } from '../utils/functions/run-command.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Integer } from '../utils/types/integer.type';
import { ServerOptions } from './interfaces/server-options.interface';

@Service()
export class Server {
  private defaultHost = 'localhost';

  private defaultPort: Integer = 8000;

  private instance = fastify();

  private modules: Constructor[] = [];

  private options: ServerOptions;

  private tempPath = `${tmpdir()}/northle`;

  constructor(
    private encrypter: Encrypter,
    private handler: Handler,
    private logger: Logger,
    private request: Request,
    private response: Response,
    private router: Router,
    private session: Session,
    private translator: Translator,
  ) {}

  private registerHandlers(): void {
    this.instance.setErrorHandler(async (error) => {
      await this.handler.handleError(error);
    });

    this.instance.setNotFoundHandler(() => {
      this.handler.handleNotFound();
    });
  }

  private async registerMiddleware(): Promise<void> {
    const cspOptions = this.options.config?.contentSecurityPolicy;

    const helmetOptions = {
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
              },
              ...((this.options.config?.contentSecurityPolicy ?? {}) as Record<
                string,
                unknown
              >),
            },
    };

    const corsOptions = this.options.config?.cors ?? {};

    const cookieOptions = {
      secret: env('ENCRYPT_KEY') ?? this.encrypter.randomBytes(16),
    };

    const multipartOptions = {
      limits: {
        fieldSize: (env<number>('FIELD_LIMIT') ?? 10) * 1024 * 1024,
        fileSize: (env<number>('UPLOAD_LIMIT') ?? 100) * 1024 * 1024,
      },
    };

    const sessionOptions = {
      secret: env('ENCRYPT_KEY') ?? this.encrypter.randomBytes(16),
      cookie: {
        maxAge: (env<number>('SESSION_LIFETIME') ?? 7) * 1000 * 60 * 60 * 24,
      },
    };

    const staticServerOptions = {
      root: path.resolve('public'),
    };

    await this.instance.register(helmetMiddleware, helmetOptions);
    await this.instance.register(corsMiddleware, corsOptions);
    await this.instance.register(cookieMiddleware, cookieOptions);
    await this.instance.register(csrfMiddleware);
    await this.instance.register(multipartMiddleware, multipartOptions);
    await this.instance.register(sessionMiddleware, sessionOptions);
    await this.instance.register(staticServerMiddleware, staticServerOptions);
  }

  private async setupDevelopmentEnvironment(port: Integer): Promise<void> {
    const requiredNodeVersion = (
      await readJson(`${fileURLToPath(import.meta.url)}/../../../package.json`)
    ).engines.node;

    const satisfiesVersion = process.version.localeCompare(
      requiredNodeVersion,
      undefined,
      {
        numeric: true,
        sensitivity: 'base',
      },
    );

    if (satisfiesVersion === -1) {
      this.logger.warn(
        `Northle requires Node.js version ${requiredNodeVersion.slice(
          2,
        )} or greater`,
      );

      this.logger.warn('Update Node.js on https://nodejs.org');

      process.exit(1);
    }

    if (!existsSync(this.tempPath)) {
      await writeFile(this.tempPath, 'Northle development server is running...');

      const browserAliases: Record<string, string> = {
        darwin: 'open',
        linux: 'sensible-browser',
        win32: 'explorer',
      };

      if (this.options.config?.dev?.openBrowser ?? true) {
        runCommand(
          `${
            browserAliases[process.platform] ?? 'xdg-open'
          } http://localhost:${port}`,
        );
      }
    }
  }

  public $nativeHttpServer() {
    return this.instance.server;
  }

  public async setup(options: ServerOptions): Promise<this> {
    try {
      this.options = options;

      process.on('uncaughtException', (error) => {
        this.handler.handleFatalError(error);
      });

      const envFile = options.config?.envFile ?? '.env';

      if (!existsSync(envFile)) {
        throw new Error('Environment configuration file is missing');
      }

      configDotenv({
        path: envFile,
      });

      const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

      signals.map((signal) => {
        process.on(signal, async () => {
          if (existsSync(this.tempPath)) {
            await unlink(this.tempPath);
          }

          process.exit();
        });
      });

      if (!(options.config?.logger ?? true)) {
        this.logger.$disable();
      }

      options.modules.map((module: Constructor) => {
        const instance = inject(module);

        this.modules.push(instance);
      });

      this.translator.setLocale(options.config?.locale);

    } catch (error) {
      await this.handler.handleError(error as Error);
    }

    return this;
  }

  public async start(
    port = env<Integer>('PORT') ?? this.defaultPort,
    host = env('HOST') ?? this.defaultHost,
  ): Promise<void> {
    try {
      let startTime: [number, number];

      this.instance.addHook('onRequest', async (request, response) => {
        this.request.$setInstance(request);
        this.response.$setInstance(response);

        startTime = process.hrtime();
      });

      this.instance.addHook('onResponse', async (request, response) => {
        this.session.set('_previousUrl', request.url);

        const endTime = process.hrtime(startTime);

        const elapsedTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(1);
        const timeFormatted = chalk.gray(`${elapsedTime} ms`.padStart(9, ' '));

        const status = response.statusCode;
        const red = this.logger.colorRed;
        const yellow = this.logger.colorYellow;

        const statusMapping = {
          [String(status >= 100 && status < 200)]: chalk.blueBright(status),
          [String(status >= 200 && status < 400)]: chalk.green(status),
          [String(status >= 400 && status < 500)]: chalk.hex(yellow)(status),
          [String(status >= 500 && status < 600)]: chalk.hex(red)(status),
        };

        const formattedStatus = statusMapping['true'] ?? status.toString();

        this.logger.log(
          `${chalk.bold(formattedStatus)} ${this.request.method()} ${request.url}`,
          'request',
          timeFormatted,
        );
      });

      await this.registerMiddleware();

      this.router.registerRoutes(this.instance);
      this.registerHandlers();

      const testServer = createServer();
      const originalPort = port;

      testServer.once('error', () => {
        port += 1;

        this.logger.warn(
          `Port ${originalPort} is not available. Server will listen at port ${port}`,
        );

        testServer.close();
        testServer.listen(port);
      });

      testServer.once('listening', async () => {
        testServer.close();

        await this.instance.listen({ port, host });

        if (env<boolean>('DEVELOPMENT')) {
          this.setupDevelopmentEnvironment(port);
        }
      });

      testServer.listen(port);
    } catch (error) {
      await this.handler.handleError(error as Error);
    }
  }
}
