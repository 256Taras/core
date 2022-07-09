import dotenv from 'dotenv';
import { env } from '../config/env.function';
import { exec } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import express, { Request, Response } from 'express';

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

    const port = env('APP_PORT') ?? 8000;

    if (env('APP_DEBUG')) {
      this.setupDevelopmentEnvironment(port as number);
    }

    const app = express();

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
