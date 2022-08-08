import { Handler } from '../handler/handler.class';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { Injector } from '../injector/injector.class';
import { Router } from '../routing/router.class';
import { env } from '../utils/functions/env.function';
import { error } from '../utils/functions/error.function';
import { info } from '../utils/functions/info.function';
import { log } from '../utils/functions/log.function';
import { runCommand } from '../utils/functions/run-command.function';
import { warn } from '../utils/functions/warn.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { ViewRenderer } from '../views/view-renderer.class';
import { Module } from './interfaces/module.interface';
import { ServerOptions } from './interfaces/server-options.interface';
import { Service } from '../injector/decorators/service.decorator';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csrf from 'csurf';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import multer from 'multer';
import session from 'express-session';
import helmet from 'helmet';
import methodOverride from 'method-override';
import { existsSync, promises, unlinkSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import semver from 'semver';

@Service()
export class Server {
  private defaultPort = 8000;

  private modules: Module[] = [];

  private options: ServerOptions;

  constructor(private handler: Handler, private router: Router, private viewRenderer: ViewRenderer) {}

  private async setupDevelopmentEnvironment(port: number): Promise<void> {
    const packageData = await promises.readFile(
      `${fileURLToPath(import.meta.url)}/../../../package.json`,
    );

    const requiredNodeVersion = JSON.parse(packageData.toString()).engines.node;

    if (!semver.satisfies(process.version, requiredNodeVersion)) {
      warn(
        `Norther requires Node.js version ${requiredNodeVersion.slice(
          2,
        )} or greater`,
      );

      warn('Update Node.js on https://nodejs.org');

      process.exit(1);
    }

    const tempPath = `${tmpdir()}/norther`;

    (['SIGINT', 'SIGTERM', 'SIGHUP', 'exit'] as (NodeJS.Signals | 'exit')[]).map(
      (signal) => {
        process.on(signal, () => {
          if (existsSync(tempPath)) {
            unlinkSync(tempPath);
          }

          process.exit();
        });
      },
    );

    if (!existsSync(tempPath)) {
      writeFileSync(tempPath, 'Norther development server is running...');

      info('Norther server started [press q or esc to quit]');

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

  private configureServer(server: Express): void {
    server.engine('atom.html', this.viewRenderer.parse);

    server.set('trust proxy', 1);
    server.set('x-powered-by', false);
    server.set('views', 'views');
    server.set('view engine', 'atom.html');
  }

  private registerMiddleware(server: Express): void {
    server.use(helmet());
    server.use(compression());
    server.use(cookieParser());
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(cors());

    server.use(express.static('public'));

    server.use((request, response, next) => {
      Injector.get(Request).__setInstance(request);
      Injector.get(Response).__setInstance(response);

      log(`${request.method} ${request.url}`, 'request');

      process.on('uncaughtException', (exception: any) => {
        if (exception !== Object(exception)) {
          return;
        }

        const message =
          exception.message.charAt(0).toUpperCase() + exception.message.slice(1);

        error(message, 'uncaught exception');

        if (!env<boolean>('APP_DEBUG')) {
          process.exit(1);
        }
      });

      next();
    });

    server.use(multer({
      storage: multer.diskStorage({
        destination: (_request, _file, callback) => {
          callback(null, tmpdir());
        },
        filename: (_request, _file, callback) => {
          callback(null, randomUUID());
        },
      }),
    }).array('files'));

    server.use(
      methodOverride((request) => {
        if (request.body && '_method' in request.body) {
          const method = request.body._method;

          delete request.body._method;

          return method;
        }
      }),
    );

    server.use(
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

    server.use((request, response, next) => {
      csrf({ cookie: true })(request, response, (error) => {
        if (error) {
          this.handler.handleInvalidToken(request, response);

          return;
        }

        next();
      });
    });

    server.use(this.handler.handleException);
  }

  private registerRoutes(server: Express): void {
    this.router.registerRoutes(server);

    server.all('*', this.handler.handleNotFound);
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

    const server = express();

    this.configureServer(server);
    this.registerMiddleware(server);
    this.registerRoutes(server);

    server.listen(port, () => {
      if (env<boolean>('APP_DEBUG')) {
        this.setupDevelopmentEnvironment(port);
      }

      log(`HTTP server running on http://localhost:${port}`);
    });
  }
}
