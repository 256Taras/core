import cookieMiddleware from '@fastify/cookie';
import fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { Request } from '../../src/http/request.class';
import { Response } from '../../src/http/response.class';
import { inject } from '../../src/injector/functions/inject.function';
import { Session } from '../../src/session/session.class';
import { Validator } from '../../src/validator/validator.class';

describe('Validator class', async () => {
  const request = inject(Request);
  const response = inject(Response);

  inject(Validator).$setRequest(request);
  inject(Validator).$setResponse(response);
  
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
