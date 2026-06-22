import type { ActiveCellType } from '../utils/types.ts';
import hasAvailableMoves from './HasAvailableMoves.ts';
import { EventList } from '../engine/EventList.ts';
import { EventBus } from '../engine/EventBus.ts';

const checkGameOver = (cells: ActiveCellType[], size: number, bus: EventBus<Record<string, unknown>>,
) => {
  if (!hasAvailableMoves(cells, size)) {
    bus.emit(EventList.GAME_OVER, null);
  }
};

export default checkGameOver;
