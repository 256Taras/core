import { FastifyInstance } from 'fastify';
import { Handler } from '../handler/handler.class';
import { DownloadResponse } from '../http/download-response.class';
import { HttpMethod } from '../http/enums/http-method.enum';
import { JsonResponse } from '../http/json-response.class';
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

      let responseData = Injector.resolve<any>(controller)[method](...requestParams);

      if (responseData instanceof Promise) {
        responseData = await responseData;
      }

      switch (true) {
        case responseData instanceof DownloadResponse: {
          const { file } = responseData as DownloadResponse;

          this.response.download(file);

          break;
        }

        case responseData instanceof JsonResponse: {
          const { data } = responseData as JsonResponse;

          this.response.json(data);

          break;
        }

        case responseData instanceof RedirectResponse: {
          const { data, statusCode, url } = responseData as RedirectResponse;

          this.response.redirect(url, data);
          this.response.status(statusCode);

          break;
        }

        case responseData instanceof ViewResponse: {
          const { data, file } = responseData as ViewResponse;

          this.response.render(file, data);

          break;
        }

        default:
          this.response.send(responseData);
      }
    } catch (error) {
      this.handler.handleError(error as Error);
    }
  }
}
