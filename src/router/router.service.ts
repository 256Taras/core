import { Reflection as Reflect } from '@abraham/reflection';
import { FastifyInstance } from 'fastify';
import { Encrypter } from '../encrypter/encrypter.service.js';
import { EncryptionAlgorithm } from '../encrypter/types/encryption-algorithm.type.js';
import { Handler } from '../handler/handler.service.js';
import { DownloadResponse } from '../http/download-response.service.js';
import { HttpMethod } from '../http/enums/http-method.enum.js';
import { JsonResponse } from '../http/json-response.service.js';
import { RedirectBackResponse } from '../http/redirect-back-response.service.js';
import { RedirectResponse } from '../http/redirect-response.service.js';
import { Request } from '../http/request.service.js';
import { Response } from '../http/response.service.js';
import { ViewResponse } from '../http/view-response.service.js';
import { Service } from '../injector/decorators/service.decorator.js';
import { inject } from '../injector/functions/inject.function.js';
import { Constructor } from '../utils/interfaces/constructor.interface.js';
import { Integer } from '../utils/types/integer.type.js';
import { Route } from './interfaces/route.interface.js';

@Service()
export class Router {
  private routes: Route[] = [];

  constructor(
    private encrypter: Encrypter,
    private handler: Handler,
    private request: Request,
    private response: Response,
  ) {}

  public createRoute(url: string, method: HttpMethod, action: () => unknown): void {
    const route = {
      url,
      method,
      action,
    };

    this.routes.push(route);
  }

  public registerRoutes(server: FastifyInstance): void {
    this.routes.map((route: Route) => {
      server.route({
        method: route.method,
        url: route.url,
        handler: route.action,
      });
    });
  }

  public async respond(
    controller: Constructor,
    method: string | symbol,
    ...args: unknown[]
  ): Promise<void> {
    const requestParams = Object.values(this.request.params);

    if (this.response.isTerminated()) {
      return;
    }

    try {
      const resolvedParams = requestParams.map((param, index) => {
        const encryptionData = Reflect.getMetadata<{
          algorithm: EncryptionAlgorithm;
          indexes: Integer[];
        }>('encryptedParams', inject(controller)[method]);

        return encryptionData?.indexes?.includes(index)
          ? this.encrypter.decrypt(param, encryptionData?.algorithm)
          : param;
      });

      let content = inject(controller)[method](...resolvedParams, ...args);

      if (content instanceof Promise) {
        content = await content;
      }

      const isObject = typeof content === 'object' && content !== null;

      switch (true) {
        case content instanceof DownloadResponse: {
          const { file } = content as DownloadResponse;

          this.response.download(file);

          break;
        }

        case content instanceof JsonResponse: {
          const { data } = content as JsonResponse;

          this.response.json(data);

          break;
        }

        case content instanceof RedirectBackResponse: {
          const { data, statusCode } = content as RedirectBackResponse;

          this.response.redirectBack(data, statusCode);

          break;
        }

        case content instanceof RedirectResponse: {
          const { data, statusCode, url } = content as RedirectResponse;

          this.response.redirect(url, data, statusCode);

          break;
        }

        case content instanceof ViewResponse: {
          const { data, file } = content as ViewResponse;

          await this.response.render(file, data);

          break;
        }

        case Array.isArray(content) ||
          (isObject && content.constructor === Object): {
          this.response.json(content);

          break;
        }

        case [null, undefined].includes(content): {
          this.response.send(String(content));

          break;
        }

        default:
          this.response.send(content);
      }
    } catch (error) {
      await this.handler.handleError(error as Error);
    }
  }
}
