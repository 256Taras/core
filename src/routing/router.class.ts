import { Exception } from '../handler/exception.class';
import { Handler } from '../handler/handler.class';
import { DownloadResponse } from '../http/download-response.class';
import { Method } from '../http/enums/method.enum';
import { JsonResponse } from '../http/json-response.class';
import { RedirectResponse } from '../http/redirect-response.class';
import { Request } from '../http/request.class';
import { Response } from '../http/response.class';
import { ViewResponse } from '../http/view-response.class';
import { Service } from '../injector/decorators/service.decorator';
import { Injector } from '../injector/injector.class';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Route } from './route.class';
import { Express } from 'express';

@Service()
export class Router {
  private routes: Route[] = [];

  constructor(
    private handler: Handler,
    private request: Request,
    private response: Response,
  ) {}

  public get(url: string, action: () => any): void {
    this.routes.push(new Route(url, Method.Get, action));
  }

  public post(url: string, action: () => any): void {
    this.routes.push(new Route(url, Method.Post, action));
  }

  public put(url: string, action: () => any): void {
    this.routes.push(new Route(url, Method.Put, action));
  }

  public patch(url: string, action: () => any): void {
    this.routes.push(new Route(url, Method.Patch, action));
  }

  public delete(url: string, action: () => any): void {
    this.routes.push(new Route(url, Method.Delete, action));
  }

  public options(url: string, action: () => any): void {
    this.routes.push(new Route(url, Method.Options, action));
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

        case responseData instanceof ViewResponse: {
          const { data, file } = responseData as ViewResponse;

          this.response.render(file, data);

          break;
        }

        case responseData instanceof RedirectResponse: {
          const { data, url } = responseData as RedirectResponse;

          this.response.redirect(url);

          if (data) {
            this.request.session._redirectData = data;
          }

          break;
        }

        default:
          this.response.send(responseData);
      }
    } catch (exception) {
      this.handler.handleException(exception as TypeError | Exception);
    }
  }

  public registerRoutes(server: Express): void {
    this.routes.map((route: Route) => {
      switch (route.method) {
        case Method.Delete:
          server.delete(route.url, route.action);

          break;

        case Method.Get:
          server.get(route.url, route.action);

          break;

        case Method.Options:
          server.options(route.url, route.action);

          break;

        case Method.Patch:
          server.patch(route.url, route.action);

          break;

        case Method.Post:
          server.post(route.url, route.action);

          break;

        case Method.Put:
          server.put(route.url, route.action);

          break;
      }
    });
  }
}
