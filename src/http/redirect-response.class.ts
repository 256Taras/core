export class RedirectResponse {
  constructor(
    public readonly url: string,
    public readonly data?: Record<string, any>,
  ) {}
}
