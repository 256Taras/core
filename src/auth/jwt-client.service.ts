import { createHmac } from 'node:crypto';
import { Configurator } from '../configurator/configurator.service.js';
import { env } from '../configurator/functions/env.function.js';
import { Encrypter } from '../encrypter/encrypter.service.js';
import { Service } from '../injector/decorators/service.decorator.js';
import { inject } from '../injector/functions/inject.function.js';

@Service()
export class JwtClient {
  private readonly encrypter = inject(Encrypter);

  private readonly key = inject(Configurator).entries?.jwt?.key ?? env<string>('JWT_KEY')!;

  private createHeader(): string {
    return this.encrypter.base64Encode(
      JSON.stringify({
        alg: 'HS256',
        typ: 'JWT',
      }),
    );
  }

  public generateToken(payload: unknown): string {
    const header = this.createHeader();

    const payloadData = this.encrypter.base64Encode(JSON.stringify(payload));

    const signature = createHmac('sha256', this.key);

    signature.update(`${header}.${payloadData}`);

    return `${header}.${payloadData}.${signature
      .digest('base64')
      .replaceAll(/\+\//g, '-')
      .replaceAll('=', '')}`;
  }
}
