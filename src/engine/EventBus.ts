export class EventBus<Events extends Record<string, unknown>> {
  private listeners: {
    [K in keyof Events]?: Set<(payload: Events[K]) => void>
  } = {};

  on<K extends keyof Events>(
    event: K,
    handler: (payload: Events[K]) => void
  ) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(handler);
  }

  off<K extends keyof Events>(
    event: K,
    handler: (payload: Events[K]) => void
  ) {
    this.listeners[event]?.delete(handler);
  }

  emit<K extends keyof Events>(
    event: K,
    payload: Events[K]
  ) {
    this.listeners[event]?.forEach(listener => listener(payload));
  }
}
