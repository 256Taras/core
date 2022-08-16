export class ViewResponse {
  constructor(
    public readonly file: string,
    public readonly data?: Record<string, any>,
  ) {}
}
