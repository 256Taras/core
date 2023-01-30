import { StatusCode } from '../../http/enums/status-code.enum.js';
import { MiddlewareHandler } from '../../http/interfaces/middleware-handler.interface.js';
import { Constructor } from '../../utils/interfaces/constructor.interface.js';
import { Integer } from '../../utils/types/integer.type.js';
import { RouteUrl } from '../types/route-url.type.js';

export interface RouteOptions {
  middleware?: Constructor<MiddlewareHandler> | Constructor<MiddlewareHandler>[];
  redirectTo?: RouteUrl;
  statusCode?: StatusCode;
  maxRequestsPerMinute?: Integer;
}
