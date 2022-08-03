import { Exception } from '../handler/exception.class';
import { Handler } from '../handler/handler.class';
import { Method } from '../http/enums/method.enum';
import { JsonResponse } from '../http/json-response.class';
import { RedirectResponse } from '../http/redirect-response.class';
import { ViewResponse } from '../http/view-response.class';
import { Injector } from '../injector/injector.class';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { View } from '../views/view.class';
import { Route } from './route.class';
import { Express, Request, Response } from 'express';

export class Router {
  private static routes: Route[] = [];

  public static get(
    url: string,
    action: (request: Request, response: Response) => any,
  ): void {
    this.routes.push(new Route(url, Method.Get, action));
  }

  public static post(
    url: string,
    action: (request: Request, response: Response) => any,
  ): void {
    this.routes.push(new Route(url, Method.Post, action));
  }

  public static put(
    url: string,
    action: (request: Request, response: Response) => any,
  ): void {
    this.routes.push(new Route(url, Method.Put, action));
  }

  public static patch(
    url: string,
    action: (request: Request, response: Response) => any,
  ): void {
    this.routes.push(new Route(url, Method.Patch, action));
  }

  public static delete(
    url: string,
    action: (request: Request, response: Response) => any,
  ): void {
    this.routes.push(new Route(url, Method.Delete, action));
  }

  public static options(
    url: string,
    action: (request: Request, response: Response) => any,
  ): void {
    this.routes.push(new Route(url, Method.Options, action));
  }

  public static respond(
    request: Request,
    response: Response,
    controller: Constructor,
    method: string,
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
          const { file } = responseData as ViewResponse;

          View.render(request, response, file, data);

          break;

        case responseData instanceof RedirectResponse:
          const { url } = responseData as RedirectResponse;

          response.redirect(url);

          if (data) {
            request.session._redirectData = data;
          }

          break;

        default:
          response.send(responseData);
      }
    } catch (exception) {
      Handler.handleException(exception as TypeError | Exception, request, response);
    }
  }

  public static registerRoutes(server: Express): void {
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
