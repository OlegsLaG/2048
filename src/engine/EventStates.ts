import type { EventBus } from './EventBus.ts';
import { EventList } from './EventList.ts';

export class EventStates {
  constructor(private bus: EventBus) {
    bus.on(EventList.MOVE_UP, (coordinates: { x?: number | string, y?: number | string }, callback: () => void) => this.move(EventList.MOVE_UP, coordinates, callback));
    bus.on(EventList.MOVE_RIGHT, (coordinates: { x?: number | string, y?: number | string }, callback: () => void) => this.move(EventList.MOVE_RIGHT, coordinates, callback));
    bus.on(EventList.MOVE_DOWN, (coordinates: { x?: number | string, y?: number | string }, callback: () => void) => this.move(EventList.MOVE_DOWN, coordinates, callback));
    bus.on(EventList.MOVE_LEFT, (coordinates: { x?: number | string, y?: number | string }, callback: () => void) => this.move(EventList.MOVE_LEFT, coordinates, callback));
  }

  move(direction: string, coordinates: { x?: number | string, y?: number | string }, callback: (coordinates: { x?: number | string, y?: number | string }) => void) {
    console.warn(`Move ${direction} to `, coordinates);

    callback(coordinates);
  }
}
