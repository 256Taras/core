export class Exception extends Error {
  constructor(
    public readonly message: string,
    public readonly name: string = 'Exception',
  ) {
    super();
  }
}
