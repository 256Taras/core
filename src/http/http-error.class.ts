import { StatusCode } from './enums/status-code.enum.js';

export class HttpError extends Error {
  public readonly message: string;

  constructor(public readonly statusCode: StatusCode, customMessage?: string) {
    const message = customMessage ??
      Object.keys(StatusCode)
        .find(
          (key: string) =>
            (StatusCode as unknown as Record<string, StatusCode>)[key] === statusCode,
        )
        ?.replace(/([a-z])([A-Z])/g, '$1 $2') ?? 'Unknown error';

    super(message);

    this.message = message;
  }
}
