import { FastifyRequest, FastifyReply } from 'fastify';
import { existsSync } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import { Service } from '../injector/decorators/service.decorator';
import { readJson } from '../utils/functions/read-json.function';
import { Encrypter } from '../crypto/encrypter.class';
import { env } from '../utils/functions/env.function';

@Service()
export class Session {
  private variables: Record<string, any> = {};

  private key: string | null = null;

  private request: FastifyRequest | null = null;

  private response: FastifyReply | null = null;

  constructor(private encrypter: Encrypter) {}

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

    const sessionFilePath = `node_modules/.northle/sessions/${this.key}.json`;

    if (this.key && existsSync(sessionFilePath)) {
      const savedSessionData = await readJson(sessionFilePath);

      this.variables = savedSessionData;

      return this;
    }

    const generatedId = this.encrypter.uuid();
    const path = `node_modules/.northle/sessions/${generatedId}.json`;

    this.response?.cookie('sessionId', generatedId, {
      expires: new Date(Date.now() + (env<number>('SESSION_LIFETIME') ?? 7) * 1000 * 60 * 60 * 24),
    });

    try {
      if (generatedId) {
        await writeFile(path, JSON.stringify({}), 'utf-8');
      }
    } catch (error) {
      throw new Error('Unable to initialize session');
    }

    return this;
  }

  public async $writeSession(): Promise<void> {
    const path = `node_modules/.northle/sessions/${this.key}.json`;

    try {
      await writeFile(path, JSON.stringify({
        ...this.data,
      }), 'utf-8');
    } catch (error) {
      throw new Error('Unable to write session');
    }
  }

  public get data(): Record<string, any> {
    return this.variables;
  }

  public decrement(key: string, by = 1): number {
    if (typeof this.data[key] !== 'number') {
      throw new Error(`Session value '${key}' is not a number`);
    }

    this.data[key] -= by;

    return this.data[key];
  }

  public delete(key: string): void {
    delete this.data[key];
  }

  public async destroy(): Promise<void> {
    this.variables = {};

    await unlink(`node_modules/.northle/sessions/${this.key}.json`);
  }

  public flash<T>(key: string, value?: unknown): T | void {
    const flashKey = `_flash:${key}`;

    if (value === undefined) {
      const data = this.data[flashKey] ?? null;

      this.delete(flashKey);

      return data;
    }

    this.data[flashKey] = value;
  }

  public get<T>(key: string): T | null {
    return this.data[key] ?? null;
  }

  public has(key: string): boolean {
    return key in this.data;
  }

  public id(): string {
    return this.data.id;
  }

  public increment(key: string, by = 1): number {
    if (typeof this.data[key] !== 'number') {
      throw new Error(`Session value '${key}' is not a number`);
    }

    this.data[key] += by;

    return this.data[key];
  }

  public set(name: string, value: unknown): void {
    this.data[name] = value;
  }
}
