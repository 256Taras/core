import { Exception } from '../handler/exception.class';
import { Handler } from '../handler/handler.class';
import { Method } from '../http/enums/method.enum';
import { JsonResponse } from '../http/json-response.class';
import { RedirectResponse } from '../http/redirect-response.class';
import { ViewResponse } from '../http/view-response.class';
import { Service } from '../injector/decorators/service.decorator';
import { Injector } from '../injector/injector.class';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { ViewRenderer } from '../views/view-renderer.class';
import { Route } from './route.class';
import { Express, Request, Response } from 'express';

@Service()
export class Router {
  private routes: Route[] = [];

  constructor(private handler: Handler, private viewRenderer: ViewRenderer) {}

  public get(
    url: string,
    action: (request: Request, response: Response) => any,
  ): void {
    this.routes.push(new Route(url, Method.Get, action));
  }

  public post(
    url: string,
    action: (request: Request, response: Response) => any,
  ): void {
    this.routes.push(new Route(url, Method.Post, action));
  }

  public put(
    url: string,
    action: (request: Request, response: Response) => any,
  ): void {
    this.routes.push(new Route(url, Method.Put, action));
  }

  public patch(
    url: string,
    action: (request: Request, response: Response) => any,
  ): void {
    this.routes.push(new Route(url, Method.Patch, action));
  }

  public delete(
    url: string,
    action: (request: Request, response: Response) => any,
  ): void {
    this.routes.push(new Route(url, Method.Delete, action));
  }

  public options(
    url: string,
    action: (request: Request, response: Response) => any,
  ): void {
    this.routes.push(new Route(url, Method.Options, action));
  }

  public respond(
    request: Request,
    response: Response,
    controller: Constructor,
    method: string | symbol,
  ): void {
    try {
      const responseData = Injector.resolve<any>(controller)[method](
        ...Object.values(request.params),
      );

      const { data } = responseData;

      switch (true) {
        case responseData instanceof JsonResponse:
          response.json(data);

          break;

        case responseData instanceof ViewResponse:
          this.viewRenderer.render(response, (responseData as ViewResponse).file, data);

          break;

        case responseData instanceof RedirectResponse:
          response.redirect((responseData as RedirectResponse).url);

          if (data) {
            request.session._redirectData = data;
          }

          break;

        default:
          response.send(responseData);
      }
    } catch (exception) {
      this.handler.handleException(
        exception as TypeError | Exception,
        request,
        response,
      );
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
