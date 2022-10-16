import { HttpMethod } from '../../http/enums/http-method.enum';

export interface Route {
  url: string;
  method: HttpMethod;
  action: () => unknown;
}
