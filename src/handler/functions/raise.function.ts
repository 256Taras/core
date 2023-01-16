export function raise(message: string, cause?: string) {
  if (cause) {
    throw new Error(message, {
      cause: new Error(cause),
    });
  }

  throw new Error(message);
}
