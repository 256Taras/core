import { describe, expect, it } from 'vitest';
import fastify from 'fastify';
import csrfMiddleware from '@fastify/csrf-protection';
import sessionMiddleware from '@fastify/session';
import cookieMiddleware from '@fastify/cookie';
import { inject } from '../../src/injector/functions/inject.function';
import { Request } from '../../src/http/request.class';
import { Response } from '../../src/http/response.class';
import { Encrypter } from '../../src/crypto/encrypter.class';
import { Validator } from '../../src/validator/validator.class';

describe('Validator class', async () => {
  const encrypter = inject(Encrypter);

  const app = fastify();

  await app.register(cookieMiddleware);

  await app.register(sessionMiddleware, {
    secret: encrypter.randomBytes(16),
  });

  await app.register(csrfMiddleware);

  app.get('/', async (request, response) => {
    inject(Request).$setInstance(request);
    inject(Response).$setInstance(response);

    response.send('Northle');
  });

  it('asserts data is valid', async () => {
    await app.inject({
      method: 'GET',
      url: '/'
    });

    const validator = inject(Validator);

    const isValid = validator.assert({
      name: {
        required: true,
      },
    });

    expect(isValid).toBe(false);
  });
});
