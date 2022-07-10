import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { env } from '../config/env.function';
import { exec } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import express, { Request, Response } from 'express';
import methodOverride from 'method-override';
import session from 'express-session';

export class Server {
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

    if (env('APP_DEBUG')) {
      this.setupDevelopmentEnvironment(port);
    }

    const app = express();

    app.set('trust proxy', 1);
    app.set('views', 'views');

    app.use(bodyParser.json());

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
      response.send('404 Not Found....');
    });

    app.listen(port, () => {
      console.log(`[server] HTTP server is running at http://localhost:${port}`);
    });
  }
}
