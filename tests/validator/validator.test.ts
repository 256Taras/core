import cookieMiddleware from '@fastify/cookie';
import fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { Request } from '../../src/http/request.service.js';
import { Response } from '../../src/http/response.service.js';
import { inject } from '../../src/injector/functions/inject.function.js';
import { Session } from '../../src/session/session.service.js';
import { Validator } from '../../src/validator/validator.service.js';

describe('Validator class', async () => {
  const app = fastify();

  await app.register(cookieMiddleware);

  app.get('/', async (request, response) => {
    inject(Session).$setRequest(request);
    inject(Request).$setInstance(request);
    inject(Response).$setInstance(response);

    response.send('Northle');
  });

  it('asserts data is valid', async () => {
    await app.inject({
      method: 'GET',
      url: '/',
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
