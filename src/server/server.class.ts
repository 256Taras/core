import {
  json as bodyParserJson,
  urlencoded as bodyParserUrlencoded,
} from 'body-parser';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Compiler } from '../views/compiler.class';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csrf from 'csurf';
import dotenv from 'dotenv';
import { env } from '../config/env.function';
import { exec } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import express, { Request, Response } from 'express';
import { log } from '../utils/functions/log.function';
import { Method } from '../http/enums/method.enum';
import methodOverride from 'method-override';
import { Route } from '../routing/route.class';
import { Router } from '../routing/router.class';
import { satisfies } from 'semver';
import { ServerOptions } from './interfaces/server-options.interface';
import session from 'express-session';
import { warn } from '../utils/functions/warn.function';

export class Server {
  private controllers: Constructor[] = [];

  constructor(options: ServerOptions) {}

  private setupDevelopmentEnvironment(port: number): void {
    const requiredNodeVersion = require('../../package.json').engines.node;

    if (!satisfies(process.version, requiredNodeVersion)) {
      warn(`Nucleon requires Node.js version ${requiredNodeVersion.slice(2)} or greater`);
      warn('Update Node.js on https://nodejs.org');

      process.exit(1);
    }

    const tempPath = 'storage/temp/server';

    process.on('SIGINT', () => {
      unlinkSync(tempPath);

      process.exit();
    });

    const netPrograms = {
      win32: 'explorer',
      darwin: 'open',
      linux: 'sensible-browser',
    };

    if (!existsSync(tempPath)) {
      writeFileSync(tempPath, 'Nucleon development server is running...');

      exec(
        `${
          netPrograms[process.platform as keyof object]
        } http://localhost:${port}`,
      );
    }
  }

  public start(): void {
    dotenv.config({
      path: '.env',
    });

    const port = env<number>('APP_PORT') ?? 8000;

    const app = express();

    app.engine('atom.html', Compiler.parse);

    app.set('trust proxy', 1);
    app.set('views', 'views');
    app.set('view engine', 'atom.html');

    app.use(cookieParser());
    app.use(bodyParserJson());
    app.use(bodyParserUrlencoded({ extended: true }));
    app.use(cors());
    app.use(csrf());

    app.use(express.static('public'));

    app.use(methodOverride((request: Request) => {
      if (request.body && typeof request.body === 'object' && '_method' in request.body) {
        const method = request.body._method;

        delete request.body._method;

        return method;
      }
    }));

    app.use(session({
      secret: env<string>('APP_KEY'),
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: true,
        maxAge: env<number>('SESSION_LIFETIME') * 60 * 60 * 1000,
      },
    }));

    const routes = Router.allRoutes();

    routes.map((route: Route) => {
      switch (route.method) {
        case Method.Delete:
          app.delete(route.url, route.action);

          break;

        case Method.Get:
          app.get(route.url, route.action);

          break;

        case Method.Options:
          app.options(route.url, route.action);

          break;

        case Method.Patch:
          app.patch(route.url, route.action);

          break;

        case Method.Post:
          app.post(route.url, route.action);

          break;

        case Method.Put:
          app.put(route.url, route.action);

          break;
      }
    });

    app.all('*', async (request: Request, response: Response) => {
      response.status(404);

      const data = {
        status: 404,
        message: 'Not Found',
      };

      if (request.xhr || request.headers.accept?.includes('json')) {
        response.send(data);

        return;
      }

      response.render(`${__dirname}/../../assets/views/http`, data);
    });

    app.listen(port, () => {
      if (env('APP_DEBUG')) {
        this.setupDevelopmentEnvironment(port);
      }

      log(`HTTP server is running at http://localhost:${port}`);
    });
  }
}
