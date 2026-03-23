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
    console.warn(`Register ${String(event)} listener`);
    this.listeners[event]!.add(handler);
  }

  emit<K extends keyof Events>(
    event: K,
    payload: Events[K]
  ) {
    console.warn(`Emit ${String(event)} with payload `, payload);
    this.listeners[event]?.forEach(listener => listener(payload));
  }
}
