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
import { unlink, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import semver from 'semver';
import { Encrypter } from '../crypto/encrypter.class';
import { Handler } from '../handler/handler.class';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { inject } from '../injector/functions/inject.function';
import { Logger } from '../logger/logger.class';
import { Mailer } from '../mailer/mailer.class';
import { Router } from '../router/router.class';
import { Session } from '../session/session.class';
import { Translator } from '../translator/translator.class';
import { env } from '../utils/functions/env.function';
import { runCommand } from '../utils/functions/run-command.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Integer } from '../utils/types/integer.type';
import { ServerOptions } from './interfaces/server-options.interface';

@Service()
export class Server {
  private defaultHost = 'localhost';

  private defaultPort: Integer = 8000;

  private modules: Constructor[] = [];

  private options: ServerOptions;

  private server = fastify();

  private tempPath = `${tmpdir()}/norther`;

  constructor(
    private encrypter: Encrypter,
    private handler: Handler,
    private logger: Logger,
    private mailer: Mailer,
    private request: Request,
    private response: Response,
    private router: Router,
    private session: Session,
    private translator: Translator,
  ) {
    (async () => {
      await this.mailer.setup();
    })();
  }

  private registerHandlers(): void {
    this.server.setErrorHandler(async (error) => {
      await this.handler.handleError(error);
    });

    this.server.setNotFoundHandler(() => {
      this.handler.handleNotFound();
    });
  }

  private async registerMiddleware(): Promise<void> {
    const cspDirectives = this.options.config?.contentSecurityPolicy || {
      'script-src': [`'self'`, `'unsafe-inline'`],
      'script-src-attr': `'unsafe-inline'`,
    };

    const cspOptions = {
      contentSecurityPolicy: {
        directives: {
          ...helmetMiddleware.contentSecurityPolicy.getDefaultDirectives(),
          ...cspDirectives,
        },
      },
    };

    const corsOptions = this.options.config?.cors ?? {};

    const cookieOptions = {
      secret: env('NORTHER_KEY') ?? this.encrypter.uuid(),
    };

    const multipartOptions = {
      limits: {
        fieldSize: (env<number>('FIELD_MAX_SIZE') ?? 10) * 1024 * 1024,
        fileSize: (env<number>('UPLOAD_MAX_SIZE') ?? 100) * 1024 * 1024,
      },
    };

    const sessionOptions = {
      secret: env('NORTHER_KEY') ?? this.encrypter.uuid(),
      cookie: {
        maxAge: (env<number>('SESSION_LIFETIME') ?? 7) * 1000 * 60 * 60 * 24,
      },
    };

    const staticServerOptions = {
      root: path.resolve('public'),
    };

    await this.server.register(helmetMiddleware, cspOptions);
    await this.server.register(corsMiddleware, corsOptions);
    await this.server.register(cookieMiddleware, cookieOptions);
    await this.server.register(csrfMiddleware);
    await this.server.register(multipartMiddleware, multipartOptions);
    await this.server.register(sessionMiddleware, sessionOptions);
    await this.server.register(staticServerMiddleware, staticServerOptions);
  }

  private async setupDevelopmentEnvironment(port: Integer): Promise<void> {
    const packageData = await readFile(
      `${fileURLToPath(import.meta.url)}/../../../package.json`,
    );

    const requiredNodeVersion = JSON.parse(packageData.toString()).engines.node;

    if (!semver.satisfies(process.version, requiredNodeVersion)) {
      this.logger.warn(
        `Norther requires Node.js version ${requiredNodeVersion.slice(
          2,
        )} or greater`,
      );

      this.logger.warn('Update Node.js on https://nodejs.org');

      process.exit(1);
    }

    if (!existsSync(this.tempPath)) {
      await writeFile(this.tempPath, 'Norther development server is running...');

      const browserAliases = {
        darwin: 'open',
        linux: 'sensible-browser',
        win32: 'explorer',
      };

      if (this.options.config?.dev?.openBrowser ?? true) {
        runCommand(
          `${
            browserAliases[process.platform as keyof object] ?? 'xdg-open'
          } http://localhost:${port}`,
        );
      }
    }
  }

  public setup(options: ServerOptions): this {
    this.options = options;

    process.on('uncaughtException', (error) => {
      this.handler.handleUncaughtError(error);
    });

    const envFile = options.config?.envFile ?? '.env';

    if (!existsSync(envFile)) {
      throw new Error('Environment configuration file is missing');
    }

    configDotenv({
      path: envFile,
    });

    process.on('SIGINT', async () => {
      if (existsSync(this.tempPath)) {
        await unlink(this.tempPath);
      }

      process.exit();
    });

    if (!(options.config?.logger ?? true)) {
      this.logger.$disable();
    }

    options.modules.map((module: Constructor) => {
      const instance = inject(module);

      this.modules.push(instance);
    });

    this.translator.setLocale(options.config?.locale);

    return this;
  }

  public async start(
    port = env<Integer>('NORTHER_PORT') ?? this.defaultPort,
    host = env('NORTHER_HOST') ?? this.defaultHost,
  ): Promise<void> {
    let startTime: [number, number];

    this.server.addHook('onRequest', async (request, response) => {
      this.request.$setInstance(request);
      this.response.$setInstance(response);

      startTime = process.hrtime();
    });

    this.server.addHook('onResponse', async (request, response) => {
      this.session.set('_previousUrl', request.url);

      const endTime = process.hrtime(startTime);

      const elapsedTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(1);
      const timeFormatted = chalk.gray(`${elapsedTime} ms`.padStart(8, ' '));

      const status = response.statusCode;

      const statusMapping = {
        [String(status >= 100 && status < 200)]: chalk.blueBright(status),
        [String(status >= 200 && status < 400)]: chalk.green(status),
        [String(status >= 400 && status < 500)]: chalk.hex(this.logger.colorYellow)(
          status,
        ),
        [String(status >= 500 && status < 600)]: chalk.red(status),
      };

      const formattedStatus = statusMapping['true'] ?? status.toString();

      this.logger.log(
        `${this.request.method()} ${request.url}`,
        `request ${chalk.bold(formattedStatus)}`,
        timeFormatted,
      );
    });

    await this.registerMiddleware();

    this.router.registerRoutes(this.server);
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

      await this.server.listen({ port, host });

      if (env<boolean>('NORTHER_DEV')) {
        this.setupDevelopmentEnvironment(port);
      }
    });

    testServer.listen(port);
  }
}
