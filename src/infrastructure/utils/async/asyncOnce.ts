function asyncOnce<T, V extends any[] = []>(
  loader: (...args: V) => Promise<T>,
  interval = 50,
): (...args: V) => Promise<T> {
  async function wrappedFunction(...args: V): Promise<T> {
    if (wrappedFunction.instance) {
      return wrappedFunction.instance;
    }
    if (wrappedFunction.isLoading) {
      return new Promise<T>((resolve, reject) => {
        const timer = setInterval(() => {
          if (wrappedFunction.instance) {
            clearInterval(timer);
            resolve(wrappedFunction.instance);
          } else if (wrappedFunction.error) {
            clearInterval(timer);
            reject(wrappedFunction.error);
          }
        }, interval);
      });
    }
    wrappedFunction.isLoading = true;
    try {
      wrappedFunction.instance = await loader(...args);
      wrappedFunction.isLoading = false;
    } catch (e) {
      wrappedFunction.isLoading = false;
      wrappedFunction.error = e;
      throw e;
    }
    return wrappedFunction.instance;
  }

  wrappedFunction.isLoading = false;
  wrappedFunction.instance = undefined;
  wrappedFunction.error = undefined;
  return wrappedFunction;
}

export default asyncOnce;