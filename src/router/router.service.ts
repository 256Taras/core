import { Reflection as Reflect } from '@abraham/reflection';
import { FastifyInstance } from 'fastify';
import { DownloadResponse } from '../http/download-response.service.js';
import { HttpMethod } from '../http/enums/http-method.enum.js';
import { StatusCode } from '../http/enums/status-code.enum.js';
import { HttpError } from '../http/http-error.class.js';
import { MiddlewareHandler } from '../http/interfaces/middleware-handler.interface.js';
import { JsonResponse } from '../http/json-response.service.js';
import { RedirectBackResponse } from '../http/redirect-back-response.service.js';
import { RedirectResponse } from '../http/redirect-response.service.js';
import { Request } from '../http/request.service.js';
import { Response } from '../http/response.service.js';
import { ViewResponse } from '../http/view-response.service.js';
import { Service } from '../injector/decorators/service.decorator.js';
import { inject } from '../injector/functions/inject.function.js';
import { Session } from '../session/session.service.js';
import { Constructor } from '../utils/interfaces/constructor.interface.js';
import { Integer } from '../utils/types/integer.type.js';
import { MethodDecorator } from '../utils/types/method-decorator.type.js';
import { RouteOptions } from './interfaces/route-options.interface.js';
import { Route } from './interfaces/route.interface.js';
import { ResponseContent } from './types/response-content.type.js';
import { RouteUrl } from './types/route-url.type.js';

@Service()
export class Router {
  private readonly request = inject(Request);

  private readonly response = inject(Response);

  private routes: Route[] = [];

  private readonly session = inject(Session);

  public $createRouteDecorator(methods: HttpMethod[], options?: RouteOptions) {
    return (url: RouteUrl): MethodDecorator => {
      return (originalMethod, context) => {
        this.$defineRouteMetadata(originalMethod, options);

        const callback = this.$resolveRouteAction(
          originalMethod,
          context.name as string,
        );

        methods.map((method) => {
          this.createRoute(
            this.$resolveUrl(url, originalMethod.constructor as Constructor),
            method,
            callback,
          );
        });

        return originalMethod;
      };
    };
  }

  public $defineRouteMetadata(target: object | Function, options?: RouteOptions) {
    Reflect.defineMetadata(
      'maxRequestsPerMinute',
      options?.maxRequestsPerMinute,
      target,
    );
    Reflect.defineMetadata('middleware', options?.middleware, target);
    Reflect.defineMetadata('name', options?.name, target);
    Reflect.defineMetadata('redirectUrl', options?.redirectTo, target);
    Reflect.defineMetadata('statusCode', options?.statusCode, target);
  }

  public $resolveUrl(url: RouteUrl, controller: Constructor): RouteUrl {
    let baseUrl = Reflect.getMetadata<RouteUrl>('baseUrl', controller);

    if (baseUrl && baseUrl.length > 1 && baseUrl.charAt(0) !== '/') {
      baseUrl = `/${baseUrl}`;
    }

    return baseUrl ? `${baseUrl}/${url}` : url;
  }

  public $resolveRouteAction(
    originalMethod: object | Function,
    methodName: string | symbol,
  ) {
    return async (...args: unknown[]) => {
      const middleware:
        | Constructor<MiddlewareHandler>
        | Constructor<MiddlewareHandler>[]
        | undefined = Reflect.getMetadata('middleware', originalMethod);

      if (middleware) {
        const items = Array.isArray(middleware) ? middleware : [middleware];

        items.map((item) => {
          const instance = inject(item);

          instance.handle();
        });
      }

      const redirectUrl = Reflect.getMetadata<RouteUrl>(
        'redirectUrl',
        originalMethod,
      );

      if (redirectUrl) {
        const response = inject(Response);

        response.redirect(
          redirectUrl,
          {},
          Reflect.getMetadata('redirectStatus', originalMethod),
        );

        return;
      }

      const statusCode = Reflect.getMetadata<StatusCode>(
        'statusCode',
        originalMethod,
      );

      if (statusCode) {
        this.response.status(statusCode);
      }

      const maxRequestsPerMinute = Reflect.getMetadata<Integer>(
        'maxRequestsPerMinute',
        originalMethod,
      );

      if (
        maxRequestsPerMinute !== undefined &&
        (
          this.session.get<Integer[]>(`_lastMinuteRequests:${this.request.url()}`) ??
          []
        ).length >= maxRequestsPerMinute
      ) {
        throw new HttpError(StatusCode.TooManyRequests);
      }

      await this.respond(
        originalMethod.constructor as Constructor,
        methodName,
        ...args,
      );
    };
  }

  public $routes(): Route[] {
    return this.routes;
  }

  public createRoute(
    url: RouteUrl,
    method: HttpMethod,
    action: () => unknown,
  ): void {
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
    ...args: unknown[]
  ): Promise<void> {
    if (this.response.isTerminated()) {
      return;
    }

    const resolvedParams = Object.values(this.request.params);

    let content = inject(controller)[method](...resolvedParams, ...args) as
      | Promise<ResponseContent>
      | ResponseContent;

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
        (isObject && (content as Object).constructor === Object): {
        this.response.json(content as unknown as Record<string, unknown>);

        break;
      }

      case ([null, undefined] as unknown[]).includes(content): {
        this.response.send(String(content));

        break;
      }

      default:
        this.response.send(content);
    }
  }
}
