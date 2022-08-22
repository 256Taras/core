import { Exception } from '../handler/exception.class';
import { Handler } from '../handler/handler.class';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { Injector } from '../injector/injector.class';
import { Logger } from '../logger/logger.class';
import { Router } from '../routing/router.class';
import { Translator } from '../translator/translator.class';
import { env } from '../utils/functions/env.function';
import { runCommand } from '../utils/functions/run-command.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Integer } from '../utils/types/integer.type';
import { Module } from './interfaces/module.interface';
import { ServerOptions } from './interfaces/server-options.interface';
import chalk from 'chalk';
import dotenv from 'dotenv';
import fastify, { FastifyInstance } from 'fastify';
import helmetMiddleware from '@fastify/helmet';
import cookieMiddleware from '@fastify/cookie';
import csrfMiddleware from '@fastify/csrf-protection';
import compressionMiddleware from '@fastify/compress';
import sessionMiddleware from '@fastify/session';
import multipartMiddleware from '@fastify/multipart';
import staticServerMiddleware from '@fastify/static';
import plugin from 'fastify-plugin';
import { existsSync, promises, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import semver from 'semver';

@Service()
export class Server {
  private defaultPort: Integer = 8000;

  private modules: Module[] = [];

  private options: ServerOptions;

  private server: FastifyInstance;

  constructor(
    private handler: Handler,
    private logger: Logger,
    private router: Router,
    private translator: Translator,
  ) {}

  private async setupDevelopmentEnvironment(port: Integer): Promise<void> {
    const packageData = await promises.readFile(
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

    const tempPath = `${tmpdir()}/norther`;

    const signals: (NodeJS.Signals | 'exit')[] = [
      'SIGINT',
      'SIGTERM',
      'SIGHUP',
      'exit',
    ];

    signals.map((signal) => {
      process.on(signal, () => {
        if (existsSync(tempPath)) {
          unlinkSync(tempPath);
        }

        process.exit();
      });
    });

    if (!existsSync(tempPath)) {
      writeFileSync(tempPath, 'Norther development server is running...');

      this.logger.info(
        `Norther server started ${chalk.gray(
          `[press ${chalk.white('q')} or ${chalk.white('esc')} to quit]`,
        )}`,
      );

      const browserAliases = {
        darwin: 'open',
        linux: 'sensible-browser',
        win32: 'explorer',
      };

      if (this.options.config?.dev?.openBrowser ?? true) {
        runCommand(
          `${
            browserAliases[process.platform as keyof object]
          } http://localhost:${port}`,
        );
      }
    }
  }

  private async registerMiddleware(): Promise<void> {
    await this.server.register(helmetMiddleware);

    await this.server.register(cookieMiddleware, {
      secret: env<string>('APP_KEY'),
    });

    await this.server.register(csrfMiddleware);
    await this.server.register(compressionMiddleware);
    
    await this.server.register(sessionMiddleware, {
      secret: env<string>('APP_KEY'),
    });

    await this.server.register(multipartMiddleware);

    await this.server.register(staticServerMiddleware, {
      root: '/public',
    });

    await this.server.register(plugin((fastify: FastifyInstance, _options: any, next: any) => {
      let startTime: [number, number];

      fastify.addHook('onRequest', async (request, response) => {
        Injector.get(Request).$setInstance(request);
        Injector.get(Response).$setInstance(response);

        startTime = process.hrtime();

        //next();
      });

      fastify.addHook('onResponse', async (request, response) => {
        const endTime = process.hrtime(startTime);

        const elapsedTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(1);
        const timeFormatted = chalk.gray(`(${elapsedTime} ms)`);

        const { statusCode } = response;

        let formattedStatus: string;

        switch (true) {
          case statusCode >= 100 && statusCode < 200:
            formattedStatus = chalk.blueBright(statusCode);

            break;

          case statusCode >= 200 && statusCode < 300:
            formattedStatus = chalk.green(statusCode);

            break;

          case statusCode >= 300 && statusCode < 500:
            formattedStatus = chalk.hex(this.logger.colorYellow)(statusCode);

            break;

          case statusCode >= 500 && statusCode < 600:
            formattedStatus = chalk.red(statusCode);

            break;

          default:
            formattedStatus = statusCode.toString();
        }

        this.logger.log(
          `${request.method} ${request.url} ${formattedStatus} ${timeFormatted}`,
          `request`,
        );

        //next();
      });
    }));
  }

  private registerRoutes(): void {
    this.router.registerRoutes(this.server);

    this.server.setErrorHandler((exception: any) => {
      this.handler.handleException(exception);
    });

    this.server.setNotFoundHandler(() => {
      this.handler.handleNotFound();
    });
  }

  public setup(options: ServerOptions): this {
    const { modules, config } = options;

    this.options = options;

    modules.map((module: Constructor<Module>) => {
      const instance = Injector.resolve<Module>(module);

      this.modules.push(instance);
    });

    Injector.bind([Request, Response]);

    this.translator.setLanguage(config?.language);

    return this;
  }

  public async start(
    port = env<Integer>('APP_PORT') ?? this.defaultPort,
  ): Promise<void> {
    process.on('uncaughtException', (exception: any) => {
      if (exception !== Object(exception)) {
        return;
      }

      const message =
        exception.message.charAt(0).toUpperCase() + exception.message.slice(1);

      this.logger.error(message, 'uncaught exception');

      if (!env<boolean>('APP_DEBUG')) {
        process.exit(1);
      }
    });

    if (!existsSync('.env')) {
      throw new Exception('.env configuration file is missing');
    }

    dotenv.config({
      path: '.env',
    });

    this.server = fastify({
      pluginTimeout: 20000,
    });

    await this.registerMiddleware();
    this.registerRoutes();

    await this.server.listen({ port });

    if (env<boolean>('APP_DEBUG')) {
      this.setupDevelopmentEnvironment(port);
    }

    this.logger.log(`HTTP server running on http://localhost:${port}`);
  }
}
