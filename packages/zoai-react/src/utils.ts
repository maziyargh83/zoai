export const createSubsciber = () => {
  const subscribers = new Set<VoidFunction>();

  const subscribe = (callback: VoidFunction) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };

  const notify = () => {
    subscribers.forEach((callback) => callback());
  };

  return {
    subscribe,
    notify,
  };
};
