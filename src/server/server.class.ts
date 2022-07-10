import * as constants from '../constants';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { env } from '../config/env.function';
import { encode } from 'html-entities';
import { exec } from 'child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
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

    app.engine('atom.html', (filePath: string, variables: Record<string, any>, callback) => {
      let compiled = readFileSync(filePath).toString();

      for (const expression of compiled.matchAll(/\{([a-zA-Z0-9]*?)\}/g) ?? []) {
        const name: string = expression[1];
        const isConstant = name.startsWith('NUCLEON_') || name.startsWith('NODE_');
  
        let variableValue: string = isConstant
          ? constants[name as keyof object]
          : variables[name];
  
        if (isConstant && !(name in constants)) {
          throw new Error(`The '${name}' constant is not defined`);
        }
  
        if (!isConstant && !(name in variables)) {
          throw new Error(`The '${name}' variable has not been passed to the view`);
        }
  
        variableValue = Array.isArray(variableValue) || typeof variableValue === 'object'
          ? JSON.stringify(variableValue)
          : encode(String(variableValue));
  
        compiled = compiled.replace(expression[0], variableValue);
      }

      return callback(null, compiled);
    });

    app.set('trust proxy', 1);
    app.set('views', 'views');
    app.set('view engine', 'atom.html');

    app.use(cookieParser());
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

      response.render(`${__dirname}/../../assets/views/http`, {
        status: 404,
        message: 'Not Found',
      });
    });

    app.listen(port, () => {
      console.log(`[server] HTTP server is running at http://localhost:${port}`);
    });
  }
}
