import { Handler } from '../handler/handler.class';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Service } from '../injector/decorators/service.decorator';
import { Injector } from '../injector/injector.class';
import { Logger } from '../logger/logger.class';
import { Router } from '../routing/router.class';
import { env } from '../utils/functions/env.function';
import { runCommand } from '../utils/functions/run-command.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { ViewRenderer } from '../views/view-renderer.class';
import { Module } from './interfaces/module.interface';
import { ServerOptions } from './interfaces/server-options.interface';
import bodyParser from 'body-parser';
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
} from 'express';
import session from 'express-session';
import helmet from 'helmet';
import methodOverride from 'method-override';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { existsSync, promises, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import semver from 'semver';

@Service()
export class Server {
  private defaultPort = 8000;

  private modules: Module[] = [];

  private options: ServerOptions;

  private server: Express;

  constructor(
    private handler: Handler,
    private logger: Logger,
    private router: Router,
    private viewRenderer: ViewRenderer,
  ) {}

  private async setupDevelopmentEnvironment(port: number): Promise<void> {
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

      this.logger.info('Norther server started [press q or esc to quit]');

      const browserAliases = {
        darwin: 'open',
        linux: 'sensible-browser',
        win32: 'explorer',
      };

      if (this.options.config?.openBrowser ?? true) {
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
    this.server.set('view engine', 'atom.html');

    this.server.disable('etag');

    this.server.engine(
      'atom.html',
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
    this.server.use(helmet());
    this.server.use(compression());
    this.server.use(cookieParser());
    this.server.use(bodyParser.json());
    this.server.use(bodyParser.urlencoded({ extended: true }));
    this.server.use(cors());

    this.server.use(express.static('public'));

    this.server.use((request, response, next) => {
      Injector.get(Request).__setInstance(request);
      Injector.get(Response).__setInstance(response);

      const startTime = process.hrtime();

      response.on('finish', () => {
        const endTime = process.hrtime(startTime);

        const elapsedTime = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(1);

        this.logger.log(
          `${response.statusCode} ${request.method} ${request.url}`,
          `request (${elapsedTime} ms)`,
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
            callback(null, tmpdir());
          },
          filename: (_request, _file, callback) => {
            callback(null, randomUUID());
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
          this.handler.handleInvalidToken(request, response);

          return;
        }

        next();
      });
    });

    this.server.use(
      (
        exception: any,
        request: ExpressRequest,
        response: ExpressResponse,
        _next?: NextFunction,
      ) => {
        this.handler.handleException(exception, request, response);
      },
    );
  }

  private registerRoutes(): void {
    this.router.registerRoutes(this.server);

    this.server.all('*', (request: ExpressRequest, response: ExpressResponse) => {
      this.handler.handleNotFound(request, response);
    });
  }

  public setup(options: ServerOptions): this {
    const { modules } = options;

    this.options = options;

    modules.map((module: Constructor<Module>) => {
      const instance = Injector.resolve<Module>(module);

      this.modules.push(instance);
    });

    Injector.bind([Request, Response]);

    return this;
  }

  public async start(
    port = env<number>('APP_PORT') ?? this.defaultPort,
  ): Promise<void> {
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
