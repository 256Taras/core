import {
  json as bodyParserJson,
  urlencoded as bodyParserUrlencoded,
} from 'body-parser';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Compiler } from '../views/compiler.class';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { env } from '../config/env.function';
import { exec } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import express, { Request, Response } from 'express';
import { log } from '../utils/functions/log.function';
import methodOverride from 'method-override';
import { ServerOptions } from './interfaces/server-options.interface';
import session from 'express-session';

export class Server {
  private controllers: Constructor[] = [];

  constructor(options: ServerOptions) {}

  private setupDevelopmentEnvironment(port: number): void {
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

      exec(`${netPrograms[process.platform as keyof object]} http://localhost:${port}`);
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
        maxAge: env<number>('SESSION_LIFETIME') * 60 * 60,
      },
    }));

    app.get('/', async (request: Request, response: Response) => {
      //
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
