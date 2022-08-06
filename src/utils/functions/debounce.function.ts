export const debounce = (callback: Function, timeout = 150) => {
  let timer: NodeJS.Timeout;

  return (...args: unknown[]) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      callback.apply(this, args);
    }, timeout);
  };
};
