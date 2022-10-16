export const debounce = (
  callback: (...args: unknown[]) => unknown,
  timeout = 150,
) => {
  let timer: NodeJS.Timeout;

  return async (...args: unknown[]) => {
    clearTimeout(timer);

    return new Promise((resolve) => {
      timer = setTimeout(() => {
        const result = callback(...args);

        resolve(result);
      }, timeout);
    });
  };
};
