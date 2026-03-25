import type { EventBus } from './EventBus.ts';
import { EventList } from './EventList.ts';

export class EventStates {
  constructor(private bus: EventBus) {
    bus.on(EventList.MOVE_UP, (callback: () => void) => this.move(EventList.MOVE_UP, callback));
    bus.on(EventList.MOVE_RIGHT, (callback: () => void) => this.move(EventList.MOVE_RIGHT, callback));
    bus.on(EventList.MOVE_DOWN, (callback: () => void) => this.move(EventList.MOVE_DOWN, callback));
    bus.on(EventList.MOVE_LEFT, (callback: () => void) => this.move(EventList.MOVE_LEFT, callback));
  }

  move(_direction: string, callback: () => void) {
    callback();
  }
}
