import { env } from '../config/env.function';
import { Handler } from '../handler/handler.class';
import { Method } from '../http/enums/method.enum';
import { Injector } from '../injector/injector.class';
import { Route } from '../routing/route.class';
import { Router } from '../routing/router.class';
import { log } from '../utils/functions/log.function';
import { warn } from '../utils/functions/warn.function';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { View } from '../views/view.class';
import { Module } from './interfaces/module.interface';
import { ServerOptions } from './interfaces/server-options.interface';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csrf from 'csurf';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import methodOverride from 'method-override';
import { exec } from 'node:child_process';
import { existsSync, promises, unlinkSync, watchFile, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import semver from 'semver';

export class Server<DatabaseClient> {
  private databaseClient: Constructor<DatabaseClient> | null = null;

  private defaultPort: number = 8000;

  private modules: Module[] = [];

  constructor(options: ServerOptions<DatabaseClient>) {
    const { databaseClient, modules } = options;

    this.databaseClient = databaseClient ?? null;

    modules.map((module: Constructor<Module>) => {
      const instance = Injector.resolve<Module>(module);

      this.modules.push(instance);
    });
  }

  private async setupDevelopmentEnvironment(port: number): Promise<void> {
    const packageData = await promises.readFile(
      `${fileURLToPath(import.meta.url)}/../../../package.json`,
    );

    const requiredNodeVersion = JSON.parse(packageData.toString()).engines.node;

    if (!semver.satisfies(process.version, requiredNodeVersion)) {
      warn(
        `Nucleon requires Node.js version ${requiredNodeVersion.slice(
          2,
        )} or greater`,
      );

      warn('Update Node.js on https://nodejs.org');

      process.exit(1);
    }

    const tempPath = 'storage/temp/server';

    process.on('SIGINT', () => {
      unlinkSync(tempPath);

      process.exit();
    });

    watchFile('.env', () => {
      log('Environment variables changed. Restart server to reflect changes');
    });

    const netPrograms = {
      darwin: 'open',
      linux: 'sensible-browser',
      win32: 'explorer',
    };

    if (!existsSync(tempPath)) {
      writeFileSync(tempPath, 'Nucleon development server is running...');

      exec(
        `${netPrograms[process.platform as keyof object]} http://localhost:${port}`,
      );
    }
  }

  private configureServer(server: Express): void {
    server.engine('atom.html', View.parse);

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
          Handler.handleInvalidToken(request, response);

          return;
        }

        next();
      });
    });

    server.use((request, _response, next) => {
      log(`${request.method} ${request.url}`, 'request');

      next();
    });

    server.use(Handler.handleException);
  }

  private registerRoutes(server: Express): void {
    const routes = Router.allRoutes();

    routes.map((route: Route) => {
      switch (route.method) {
        case Method.Delete:
          server.delete(route.url, route.action);

          break;

        case Method.Get:
          server.get(route.url, route.action);

          break;

        case Method.Options:
          server.options(route.url, route.action);

          break;

        case Method.Patch:
          server.patch(route.url, route.action);

          break;

        case Method.Post:
          server.post(route.url, route.action);

          break;

        case Method.Put:
          server.put(route.url, route.action);

          break;
      }
    });

    server.all('*', Handler.handleNotFound);
  }

  public async start(): Promise<void> {
    dotenv.config({
      path: '.env',
    });

    const server = express();

    this.configureServer(server);
    this.registerMiddleware(server);
    this.registerRoutes(server);

    if (this.databaseClient) {
      Injector.bind([this.databaseClient]);
    }

    const port = env<number>('APP_PORT') ?? this.defaultPort;

    server.listen(port, () => {
      if (env<boolean>('APP_DEBUG')) {
        this.setupDevelopmentEnvironment(port);
      }

      log(`HTTP server running on http://localhost:${port}`);
    });
  }
}
