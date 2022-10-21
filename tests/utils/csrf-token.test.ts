import { describe, expect, it } from 'vitest';
import fastify from 'fastify';
import csrfMiddleware from '@fastify/csrf-protection';
import sessionMiddleware from '@fastify/session';
import cookieMiddleware from '@fastify/cookie';
import { csrfToken } from '../../src/utils/functions/csrf-token.function';
import { inject } from '../../src/injector/functions/inject.function';
import { Request } from '../../src/http/request.class';
import { Response } from '../../src/http/response.class';
import { Encrypter } from '../../src/crypto/encrypter.class';

describe('csrfToken function', async () => {
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

  await app.inject({
    method: 'GET',
    url: '/'
  });

  it('returns CSRF token', async () => {
    const token = await csrfToken();

    expect(typeof token).toBe('string');
  });
});
