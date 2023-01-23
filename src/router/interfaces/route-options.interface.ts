import { StatusCode } from '../../http/enums/status-code.enum';
import { MiddlewareHandler } from '../../http/interfaces/middleware-handler.interface';
import { Constructor } from '../../utils/interfaces/constructor.interface';
import { Integer } from '../../utils/types/integer.type';

export interface RouteOptions {
  middleware?: Constructor<MiddlewareHandler> | Constructor<MiddlewareHandler>[];
  redirectTo?: string;
  statusCode?: StatusCode;
  maxRequestsPerMinute?: Integer;
}
