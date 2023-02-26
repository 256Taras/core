import { HttpMethod } from '../../http/enums/http-method.enum.js';
import { RouteUrl } from '../types/route-url.type.js';

export interface Route {
  action: () => unknown;
  method: HttpMethod;
  url: RouteUrl;
}
