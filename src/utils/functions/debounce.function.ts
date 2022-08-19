export const debounce = (callback: (...args: unknown[]) => any, timeout = 150) => {
  let timer: NodeJS.Timeout;

  return (...args: unknown[]) => {
    let result: any;

    clearTimeout(timer);

    timer = setTimeout(() => {
      result = callback(...args);
    }, timeout);

    return result;
  };
};
