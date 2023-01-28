import { HttpMethod } from '../../http/enums/http-method.enum.js';

export interface Route {
  url: string;
  method: HttpMethod;
  action: () => unknown;
}
