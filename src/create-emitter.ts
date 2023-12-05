function createEmitter() {
  type Listener = () => void;
  const listeners = new Set<Listener>();

  function subscribe(listener: Listener) {
    listeners.add(listener);

    const unsubscribe = () => {
      listeners.delete(listener);
    };

    return unsubscribe;
  }

  function notify() {
    for (const listener of listeners) {
      listener();
    }
  }

  return { subscribe, notify };
}

export default createEmitter;
