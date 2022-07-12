import { Request, Response } from 'express';
import { Method } from '../http/enums/method.enum';

export class Route {
  constructor(
    public readonly url: string,
    public readonly method: Method,
    public readonly action: (request: Request, response: Response) => any,
  ) {}
}
