import { Exception } from '../handler/exception.class';
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
import { Route } from './route.class';
import { FastifyInstance } from 'fastify';

@Service()
export class Router {
  private routes: Route[] = [];

  constructor(
    private handler: Handler,
    private request: Request,
    private response: Response,
  ) {}

  public addRoute(url: string, method: HttpMethod, action: () => any): void {
    const route = new Route(url, method, action);

    this.routes.push(route);
  }

  public registerRoutes(server: FastifyInstance): void {
    this.routes.map((route: Route) => {
      switch (route.method) {
        case HttpMethod.Copy:
          server.route({
            method: HttpMethod.Copy,
            url: route.url,
            handler: route.action,
          });

          break;

        case HttpMethod.Delete:
          server.delete(route.url, route.action);

          break;

        case HttpMethod.Get:
          server.get(route.url, route.action);

          break;

        case HttpMethod.Head:
          server.route({
            method: HttpMethod.Head,
            url: route.url,
            handler: route.action,
          });

          break;

        case HttpMethod.Lock:
          server.route({
            method: HttpMethod.Lock,
            url: route.url,
            handler: route.action,
          });

          break;

        case HttpMethod.MkCol:
          server.route({
            method: HttpMethod.MkCol,
            url: route.url,
            handler: route.action,
          });

          break;

        case HttpMethod.Move:
          server.route({
            method: HttpMethod.Move,
            url: route.url,
            handler: route.action,
          });

          break;

        case HttpMethod.Options:
          server.options(route.url, route.action);

          break;

        case HttpMethod.Patch:
          server.patch(route.url, route.action);

          break;

        case HttpMethod.Post:
          server.post(route.url, route.action);

          break;

        case HttpMethod.PropFind:
          server.route({
            method: HttpMethod.PropFind,
            url: route.url,
            handler: route.action,
          });

          break;

        case HttpMethod.PropPatch:
          server.route({
            method: HttpMethod.PropPatch,
            url: route.url,
            handler: route.action,
          });

          break;

        case HttpMethod.Put:
          server.put(route.url, route.action);

          break;

        case HttpMethod.Search:
          server.route({
            method: HttpMethod.Search,
            url: route.url,
            handler: route.action,
          });

          break;

        case HttpMethod.Trace:
          server.route({
            method: HttpMethod.Trace,
            url: route.url,
            handler: route.action,
          });

          break;

        case HttpMethod.Unlock:
          server.route({
            method: HttpMethod.Unlock,
            url: route.url,
            handler: route.action,
          });

          break;
      }
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

        case responseData instanceof ViewResponse: {
          const { data, file } = responseData as ViewResponse;

          this.response.render(file, data);

          break;
        }

        case responseData instanceof RedirectResponse: {
          const { data, url } = responseData as RedirectResponse;

          this.response.redirect(url, data);

          break;
        }

        default:
          this.response.send(responseData);
      }
    } catch (exception) {
      this.handler.handleException(exception as TypeError | Exception);
    }
  }
}
