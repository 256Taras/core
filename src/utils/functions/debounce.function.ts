export const debounce = (callback: (...args: unknown[]) => any, timeout = 150) => {
  let timer: NodeJS.Timeout;

  return (...args: unknown[]) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      callback.apply(this, args);
    }, timeout);
  };
};
