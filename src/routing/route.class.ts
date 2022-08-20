import { Method } from '../http/enums/method.enum';

export class Route {
  constructor(
    public readonly url: string,
    public readonly method: Method,
    public readonly action: () => any,
  ) {}
}
