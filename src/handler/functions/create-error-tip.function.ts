export function createErrorTip(message: string) {
  return {
    cause: new Error(message),
  };
}
