import { Method } from '../http/enums/method.enum';
import { Request, Response } from 'express';

export class Route {
  constructor(
    public readonly url: string,
    public readonly method: Method,
    public readonly action: (request: Request, response: Response) => any,
  ) {}
}
