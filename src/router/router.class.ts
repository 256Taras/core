import { FastifyInstance } from 'fastify';
import { Handler } from '../handler/handler.class';
import { DownloadResponse } from '../http/download-response.class';
import { HttpMethod } from '../http/enums/http-method.enum';
import { JsonResponse } from '../http/json-response.class';
import { RedirectBackResponse } from '../http/redirect-back-response.class';
import { RedirectResponse } from '../http/redirect-response.class';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { ViewResponse } from '../http/view-response.class';
import { Service } from '../injector/decorators/service.decorator';
import { Injector } from '../injector/injector.class';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Route } from './interfaces/route.interface';

@Service()
export class Router {
  private routes: Route[] = [];

  constructor(
    private handler: Handler,
    private request: Request,
    private response: Response,
  ) {}

  public addRoute(url: string, method: HttpMethod, action: () => any): void {
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
  ): Promise<void> {
    try {
      const requestParams = Object.values(this.request.params);

      let content = Injector.resolve<any>(controller)[method](...requestParams);

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
