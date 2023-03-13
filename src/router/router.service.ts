import { Reflection as Reflect } from '@abraham/reflection';
import { FastifyInstance } from 'fastify';
import { writeFile } from 'node:fs/promises';
import { Handler } from '../handler/handler.service.js';
import { DownloadResponse } from '../http/download-response.service.js';
import { HttpMethod } from '../http/enums/http-method.enum.js';
import { StatusCode } from '../http/enums/status-code.enum.js';
import { HttpError } from '../http/http-error.class.js';
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
import { ResponseContent } from './types/response-content.type.js';

type Endpoint = `/${string}`;

type RouteDecoratorFunction<T> = T extends HttpMethod[]
  ? (
      url: Endpoint | Endpoint[],
      additionalOptions?: Partial<RouteOptions>,
    ) => MethodDecorator
  : (
      allowedMethods: HttpMethod[],
      url: Endpoint | Endpoint[],
      additionalOptions?: Partial<RouteOptions>,
    ) => MethodDecorator;

@Service()
export class Router {
  private readonly handler = inject(Handler);

  private readonly request = inject(Request);

  private readonly response = inject(Response);

  private readonly routes: Pick<RouteOptions, 'httpMethods' | 'url' | 'action'>[] =
    [];

  private readonly session = inject(Session);

  public async generateRouteTypes(): Promise<void> {
    const urls: string[] = [];

    this.routes.map((route) => {
      if (Array.isArray(route.url)) {
        urls.push(...route.url.map((url) => `'${url}'`));

        return;
      }

      urls.push(`'${route.url}'`);
    });

    const union = urls.join(' | ');

    const content = `export type RouteUrl = ${union};\n//# sourceMappingURL=route-url.type.d.ts.map`;

    await writeFile(
      'node_modules/@northle/core/dist/router/types/route-url.type.d.ts',
      content,
    );
  }

  public registerControllers(controllers: Constructor[]): void {
    controllers.map((controller) => {
      const properties = Object.getOwnPropertyNames(controller.prototype);

      const controllerRouteMethods = properties.filter((property) => {
        return (
          typeof controller.prototype[property] === 'function' &&
          !['constructor', 'toString', 'toLocaleString'].includes(property) &&
          !property.startsWith('_')
        );
      });

      controllerRouteMethods.map((controllerRouteMethod) => {
        const metadata = Reflect.getMetadata<RouteOptions>(
          'routeOptions',
          controller.prototype[controllerRouteMethod],
        )!;

        const action = this.resolveRouteAction(
          controller.prototype[controllerRouteMethod],
          controllerRouteMethod,
          controller,
        );

        const handler = Reflect.getMetadata<{ statusCode: StatusCode }>(
          'errorHandler',
          controller.prototype[controllerRouteMethod],
        );

        if (handler) {
          this.handler.setCustomHandler(handler.statusCode, action);

          return;
        }

        const urls = Array.isArray(metadata.url) ? metadata.url : [metadata.url];

        urls.map((url) => {
          this.routes.push({
            url: this.resolveUrl(url, controller),
            httpMethods: metadata.httpMethods,
            action,
          });
        });
      });
    });
  }

  public createRouteDecorator<T extends HttpMethod[] | undefined = undefined>(
    httpMethods?: T,
  ): RouteDecoratorFunction<T> {
    const callback = (
      url: Endpoint | Endpoint[],
      methods: HttpMethod[],
      additionalOptions?: Partial<RouteOptions>,
    ): MethodDecorator => {
      return (originalMethod, context) => {
        if (context.private) {
          throw new Error(
            `Controller route ${context.name as string} must be public`,
          );
        }

        if (context.static) {
          throw new Error(
            `Controller route ${context.name as string} cannot be static`,
          );
        }

        Reflect.defineMetadata(
          'routeOptions',
          {
            httpMethods: methods,
            url,
            ...additionalOptions,
          },
          originalMethod,
        );

        return originalMethod;
      };
    };

    return (
      Array.isArray(httpMethods)
        ? (
            url: Endpoint | Endpoint[],
            additionalOptions?: Partial<RouteOptions>,
          ) => {
            return callback(url, httpMethods, additionalOptions);
          }
        : (
            allowedMethods: HttpMethod[],
            url: Endpoint | Endpoint[],
            additionalOptions?: Partial<RouteOptions>,
          ) => {
            return callback(url, allowedMethods, additionalOptions);
          }
    ) as RouteDecoratorFunction<T>;
  }

  public resolveUrl(url: Endpoint, controller: Constructor): Endpoint {
    let baseUrl = Reflect.getMetadata<Endpoint>('baseUrl', controller);

    if (baseUrl && baseUrl.length > 1 && baseUrl.charAt(0) !== '/') {
      baseUrl = `/${baseUrl}`;
    }

    return baseUrl ? `${baseUrl}/${url}` : url;
  }

  public resolveRouteAction(
    method: object | Function,
    methodName: string | symbol,
    controller: Constructor,
  ) {
    return async (...args: unknown[]) => {
      const metadata = Reflect.getMetadata<RouteOptions>('routeOptions', method)!;

      const middleware = metadata.middleware;

      if (middleware) {
        const items = Array.isArray(middleware) ? middleware : [middleware];

        items.map((item) => {
          const instance = inject(item);

          instance.handle();
        });
      }

      const redirectTo = metadata.redirectTo;

      if (redirectTo) {
        const response = inject(Response);

        response.redirect(
          redirectTo,
          {},
          Reflect.getMetadata('redirectStatus', method),
        );

        return;
      }

      const statusCode = metadata.statusCode;

      if (statusCode) {
        this.response.status(statusCode);
      }

      const maxRequestsPerMinute = metadata.maxRequestsPerMinute;

      if (
        maxRequestsPerMinute !== undefined &&
        (
          this.session.get<Integer[]>(`_lastMinuteRequests:${this.request.url()}`) ??
          []
        ).length >= maxRequestsPerMinute
      ) {
        throw new HttpError(StatusCode.TooManyRequests);
      }

      await this.respond(controller, methodName, ...args);
    };
  }

  public routeListing(): Pick<RouteOptions, 'httpMethods' | 'url' | 'action'>[] {
    return this.routes;
  }

  public registerRoutes(server: FastifyInstance): void {
    this.routes.map((route) => {
      server.route({
        method: route.httpMethods[0],
        url: route.url as Endpoint,
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
