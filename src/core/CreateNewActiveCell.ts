import type { ActiveCellType } from '../utils/types.ts';
import { EventList } from '../engine/EventList.ts';
import type { EventBus } from '../engine/EventBus.ts';
import hasAvailableMoves from './HasAvailableMoves.ts';

const createNewActiveCell = (
  grid: { coordinate: { x: number, y: number } }[],
  activeCellRef: ActiveCellType[],
  cellRefs: Record<string, HTMLDivElement | null>,
  size: number,
  bus: EventBus<Record<string, unknown>>,
): ActiveCellType | null | undefined => {
  const gap = 15;
  const cellSize = (500 - gap * (size - 1)) / size;

  const occupiedSet = new Set(activeCellRef.map(cell => `${cell.coordinate.x}-${cell.coordinate.y}`));
  const freeCells = grid.filter(cell => !occupiedSet.has(`${cell.coordinate.x}-${cell.coordinate.y}`));

  if (freeCells.length === 0) {
    const hasMoves = hasAvailableMoves(activeCellRef, size);

    if (!hasMoves) {
      bus.emit(EventList.GAME_OVER, null);
    }
    return null;
  }

  const randomCell = freeCells[Math.floor(Math.random() * freeCells.length)];
  const { x, y } = randomCell.coordinate;
  const activeKey = `${x}-${y}`;
  const cellRect = cellRefs[activeKey];

  if (!cellRect) {
    return null;
  }
  if (freeCells.length > 0) {
    const randomCell = freeCells[Math.floor(Math.random() * freeCells.length)];
    const { x, y } = randomCell.coordinate;

    if (cellRect) {
      return {
        id: crypto.randomUUID(),
        coordinate: { x, y },
        value: 2,
        hidden: false,
        style: {
          transform: `translate(${x * (cellSize + gap) + gap}px, ${y * (cellSize + gap) + gap}px) scale(0)`,
        }
      };
    }
  }
}

export default createNewActiveCell;
