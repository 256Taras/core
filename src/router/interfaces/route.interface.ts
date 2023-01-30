import { HttpMethod } from '../../http/enums/http-method.enum.js';
import { RouteUrl } from '../types/route-url.type.js';

export interface Route {
  url: RouteUrl;
  method: HttpMethod;
  action: () => unknown;
}
