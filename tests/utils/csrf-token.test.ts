import fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { Request } from '../../src/http/request.class.js';
import { Response } from '../../src/http/response.class.js';
import { inject } from '../../src/injector/functions/inject.function.js';
import { Session } from '../../src/session/session.class.js';
import { csrfToken } from '../../src/utils/functions/csrf-token.function.js';

describe('csrfToken function', async () => {
  const app = fastify();

  app.get('/', async (request, response) => {
    inject(Request).$setInstance(request);
    inject(Response).$setInstance(response);

    inject(Session).$setRequest(request);
    inject(Session).$setResponse(response);

    response.send('Northle');
  });

  await app.inject({
    method: 'GET',
    url: '/',
  });

  it('returns CSRF token', () => {
    const token = csrfToken();

    expect(typeof token).toBe('string');
  });
});
