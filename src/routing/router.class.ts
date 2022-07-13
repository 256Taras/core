import { Constructor } from '../utils/interfaces/constructor.interface';
import { Injector } from '../injector/injector.class';
import { Method } from '../http/enums/method.enum';
import { Request, Response } from 'express';
import { Route } from './route.class';

export class Router {
  private static routes: Route[] = [];

  public static get(url: string, action: (request: Request, response: Response) => any): void {
    this.routes.push(new Route(url, Method.Get, action));
  }

  public static post(url: string, action: (request: Request, response: Response) => any): void {
    this.routes.push(new Route(url, Method.Post, action));
  }

  public static put(url: string, action: (request: Request, response: Response) => any): void {
    this.routes.push(new Route(url, Method.Put, action));
  }

  public static patch(url: string, action: (request: Request, response: Response) => any): void {
    this.routes.push(new Route(url, Method.Patch, action));
  }

  public static delete(url: string, action: (request: Request, response: Response) => any): void {
    this.routes.push(new Route(url, Method.Delete, action));
  }

  public static options(url: string, action: (request: Request, response: Response) => any): void {
    this.routes.push(new Route(url, Method.Options, action));
  }

  public static resolveController(
    controller: Constructor,
    method: string,
  ): any {
    const result = Injector.resolve<any>(controller)[method]();

    return result;
  }

  public static allRoutes(): Route[] {
    return this.routes;
  }
}
