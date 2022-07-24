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

  public static invokeController(controller: Constructor, method: string): any {
    const result = Injector.resolve<any>(controller)[method]();

    return result;
  }

  public static respond(
    request: Request,
    response: Response,
    controller: Constructor,
    method: string,
  ): void {
    try {
      const data = this.invokeController(controller, method);

      switch (true) {
        case data instanceof JsonResponse:
          response.json((data as JsonResponse).data);

          break;

        case data instanceof ViewResponse:
          response.render((data as ViewResponse).file, (data as ViewResponse).data, (error: Error) => {
            if (error) {
              Handler.handleException(error, request, response);
            }
          });

          break;

        case data instanceof RedirectResponse:
          response.redirect((data as RedirectResponse).url);

          if ((data as RedirectResponse).data) {
            request.session._redirectData = (data as RedirectResponse).data;
          }

          break;

        default:
          response.send(data);
      }
    } catch (exception) {
      Handler.handleException(exception as TypeError | Exception, request, response);
    }
  }

  public static allRoutes(): Route[] {
    return this.routes;
  }
}
