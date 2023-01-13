interface DebounceOptions {
  onlyAfterInitialCall?: boolean;
}

export function debounce(callback: (...args: unknown[]) => unknown, timeout = 150, options?: DebounceOptions) {
  let timer: NodeJS.Timeout;
  let initialCall = true;

  return async (...args: unknown[]) => {
    if (!options?.onlyAfterInitialCall) {
      clearTimeout(timer);
    }

    return new Promise((resolve) => {
      if (options?.onlyAfterInitialCall && initialCall) {
        initialCall = false;

        const result = callback(...args);

        resolve(result);
      }

      timer = setTimeout(() => {
        const result = callback(...args);

        resolve(result);
      }, timeout);
    });
  };
}
