import { HttpMethod } from '../http/enums/http-method.enum';

export class Route {
  constructor(
    public readonly url: string,
    public readonly method: HttpMethod,
    public readonly action: () => any,
  ) {}
}
