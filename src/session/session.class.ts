import { FastifyReply, FastifyRequest } from 'fastify';
import { existsSync } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname } from 'node:path';
import { Configurator } from '../configurator/configurator.class';
import { Encrypter } from '../crypto/encrypter.class';
import { Service } from '../injector/decorators/service.decorator';
import { inject } from '../injector/functions/inject.function';
import { env } from '../utils/functions/env.function';
import { readJson } from '../utils/functions/read-json.function';
import { FlashedData } from './interfaces/flashed-data.interface';

@Service()
export class Session {
  private readonly directoryPath =
    this.configurator.entries?.session?.path ??
    env<string>('SESSION_PATH') ??
    (this.configurator.entries?.development ?? env<boolean>('DEVELOPMENT')
      ? 'node_modules/.northle/sessions'
      : `${tmpdir()}/northle/sessions`);

  private key: string | null = null;

  private request: FastifyRequest | null = null;

  private response: FastifyReply | null = null;

  private variables: Record<string, any> = {};

  constructor(private configurator: Configurator, private encrypter: Encrypter) {
    this.encrypter = inject(Encrypter);
  }

  public $setRequest(request: FastifyRequest): this {
    this.request = request;

    return this;
  }

  public $setResponse(response: FastifyReply): this {
    this.response = response;

    return this;
  }

  public async $setup(): Promise<this> {
    this.key = this.request?.cookies?.sessionId ?? null;

    const sessionFilePath = `${this.directoryPath}/${this.key}.json`;

    if (this.key && existsSync(sessionFilePath)) {
      this.variables = await readJson(sessionFilePath);
    } else {
      const generatedId = this.encrypter.uuid({ clean: true });
      const path = `${this.directoryPath}/${generatedId}.json`;

      this.response?.cookie('sessionId', generatedId, {
        expires: new Date(
          Date.now() +
            (this.configurator.entries?.session?.lifetime ??
              env<number>('SESSION_LIFETIME') ??
              7) *
              1000 *
              60 *
              60 *
              24,
        ),
      });

      try {
        if (generatedId) {
          if (!existsSync(dirname(path))) {
            await mkdir(dirname(path), {
              recursive: true,
            });
          }

          await writeFile(path, JSON.stringify({}), 'utf-8');
        }
      } catch {
        throw new Error('Session initialization failed');
      }
    }

    return this;
  }

  public async $writeSession(): Promise<void> {
    const path = `${this.directoryPath}/${this.key}.json`;

    const data = { ...this.data };

    for (const [key, value] of Object.entries<FlashedData>(data)) {
      if (
        key.startsWith('_flash:') &&
        value.requestId < (this.get<number>('_requestId') ?? 0)
      ) {
        delete data[key];
      }
    }

    try {
      await writeFile(path, JSON.stringify(data), 'utf-8');
    } catch {
      throw new Error('Session write failed');
    }
  }

  public all(): Record<string, any> {
    return this.data;
  }

  public get data(): Record<string, any> {
    return this.variables;
  }

  public decrement(key: string, by = 1, defaultValue?: number): number {
    if (!this.has(key) && defaultValue !== undefined) {
      this.data[key] = defaultValue;
    }

    if (typeof this.data[key] !== 'number') {
      throw new Error(
        `Cannot decrement session value '${key}' as it is not a number`,
      );
    }

    this.data[key] -= by;

    return this.data[key];
  }

  public delete(key: string): void {
    delete this.data[key];
  }

  public async destroy(): Promise<void> {
    this.variables = {};

    await unlink(`${this.directoryPath}/${this.key}.json`);
  }

  public flash<T = string>(key: string, value?: unknown): T | null {
    const flashKey = `_flash:${key}`;

    if (value === undefined) {
      return (this.data[flashKey] as FlashedData)?.value ?? null;
    }

    (this.data[flashKey] as FlashedData) = {
      requestId: this.get('_requestId') ?? 0,
      value,
    };

    return value as T;
  }

  public get flashed(): Record<string, any> {
    const data: Record<string, any> = {};

    for (const [key, value] of Object.entries<FlashedData>(this.data)) {
      if (key.startsWith('_flash:')) {
        data[key] = value.value;
      }
    }

    return data;
  }

  public get<T = string>(key: string, defaultValue: unknown = null): T | null {
    return this.data[key] ?? defaultValue;
  }

  public has(key: string): boolean {
    return key in this.data;
  }

  public increment(key: string, by = 1, defaultValue?: number): number {
    if (!this.has(key) && defaultValue !== undefined) {
      this.data[key] = defaultValue;
    }

    if (typeof this.data[key] !== 'number') {
      throw new Error(
        `Cannot increment session value '${key}' as it is not a number`,
      );
    }

    this.data[key] += by;

    return this.data[key];
  }

  public set(name: string, value: unknown): void {
    this.data[name] = value;
  }
}
