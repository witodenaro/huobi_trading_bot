export const debounced = (fn: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout | null;

  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};
