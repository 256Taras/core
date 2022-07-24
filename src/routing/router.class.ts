import { Exception } from '../handler/exception.class';
import { Handler } from '../handler/handler.class';
import { Method } from '../http/enums/method.enum';
import { JsonResponse } from '../http/json-response.class';
import { RedirectResponse } from '../http/redirect-response.class';
import { ViewResponse } from '../http/view-response.class';
import { Injector } from '../injector/injector.class';
import { Constructor } from '../utils/interfaces/constructor.interface';
import { Route } from './route.class';
import { Request, Response } from 'express';

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
      const responseData = Injector.resolve<any>(controller)[method](...Object.values(request.params));
      const { data } = responseData;

      switch (true) {
        case responseData instanceof JsonResponse:
          response.json(data);

          break;

        case responseData instanceof ViewResponse:
          const { file } = responseData as ViewResponse;

          response.render(file, data, (error: Error) => {
            if (error) {
              Handler.handleException(error, request, response);
            }
          });

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

  public static allRoutes(): Route[] {
    return this.routes;
  }
}
