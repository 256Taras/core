import { Encrypter } from '../crypto/encrypter.class';
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
import { ViewRenderer } from '../views/view-renderer.class';
import { Module } from './interfaces/module.interface';
import { ServerOptions } from './interfaces/server-options.interface';
import bodyParser from 'body-parser';
import chalk from 'chalk';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csrf from 'csurf';
import dotenv from 'dotenv';
import express, {
  Express,
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
  static as staticFileServer,
} from 'express';
import session from 'express-session';
import helmet from 'helmet';
import methodOverride from 'method-override';
import multer from 'multer';
import { existsSync, promises, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import semver from 'semver';

@Service()
export class Server {
  private defaultPort: Integer = 8000;

  private modules: Module[] = [];

  private options: ServerOptions;

  private server: Express;

  constructor(
    private encrypter: Encrypter,
    private handler: Handler,
    private logger: Logger,
    private router: Router,
    private translator: Translator,
    private viewRenderer: ViewRenderer,
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

  private configureServer(): void {
    this.server.set('trust proxy', 1);
    this.server.set('x-powered-by', false);
    this.server.set('views', 'views');
    this.server.set('view engine', 'north.html');

    this.server.disable('etag');

    this.server.engine(
      'north.html',
      (
        file: string,
        data: Record<string, any>,
        callback: (error: any, rendered?: string | undefined) => void,
      ) => {
        this.viewRenderer.parse(file, data, callback);
      },
    );
  }

  private registerMiddleware(): void {
    const mainMiddleware = [
      helmet(),
      compression(),
      cookieParser(),
      bodyParser.json(),
      bodyParser.urlencoded({ extended: true }),
      cors(),
      staticFileServer('public'),
    ];

    mainMiddleware.map((middleware) => {
      this.server.use(middleware);
    });

    this.server.use((request, response, next) => {
      Injector.get(Request).$setInstance(request);
      Injector.get(Response).$setInstance(response);

      const startTime = process.hrtime();

      response.on('finish', () => {
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
      });

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

      next();
    });

    this.server.use(
      multer({
        storage: multer.diskStorage({
          destination: (_request, _file, callback) => {
            callback(null, `${tmpdir()}/norther/uploads`);
          },
          filename: (_request, _file, callback) => {
            callback(null, this.encrypter.uuid());
          },
        }),
      }).array('files'),
    );

    this.server.use(
      methodOverride((request) => {
        if (request.body && '_method' in request.body) {
          const method = request.body._method;

          delete request.body._method;

          return method;
        }
      }),
    );

    this.server.use(
      session({
        secret: env<string>('APP_KEY'),
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: true,
          maxAge: env<number>('SESSION_LIFETIME') * 60 * 1000,
        },
      }),
    );

    this.server.use((request, response, next) => {
      csrf({ cookie: true })(request, response, (error) => {
        if (error) {
          this.handler.handleInvalidToken();

          return;
        }

        next();
      });
    });

    this.server.use(
      (
        exception: any,
        _request: ExpressRequest,
        _response: ExpressResponse,
        _next?: NextFunction,
      ) => {
        this.handler.handleException(exception);
      },
    );
  }

  private registerRoutes(): void {
    this.router.registerRoutes(this.server);

    this.server.all('*', () => {
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
    if (!existsSync('.env')) {
      throw new Exception('.env configuration file is missing');
    }

    dotenv.config({
      path: '.env',
    });

    this.server = express();

    this.configureServer();
    this.registerMiddleware();
    this.registerRoutes();

    this.server.listen(port, () => {
      if (env<boolean>('APP_DEBUG')) {
        this.setupDevelopmentEnvironment(port);
      }

      this.logger.log(`HTTP server running on http://localhost:${port}`);
    });
  }
}
