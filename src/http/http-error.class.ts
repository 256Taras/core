import { StatusCode } from './enums/status-code.enum.js';

export class HttpError extends Error {
  constructor(public readonly status: StatusCode, public readonly message: string) {
    super(message);
  }
}
