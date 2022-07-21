import { Method } from '../http/enums/method.enum';
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

  public static resolveController(controller: Constructor, method: string): any {
    const result = Injector.resolve<any>(controller)[method]();

    return result;
  }

  public static respond(
    response: Response,
    controller: Constructor,
    method: string,
  ): void {
    const data = this.resolveController(controller, method);

    switch (true) {
      case data instanceof ViewResponse:
        response.render((data as ViewResponse).file, (data as ViewResponse).data);

        break;

      default:
        response.send(data);
    }
  }

  public static allRoutes(): Route[] {
    return this.routes;
  }
}
