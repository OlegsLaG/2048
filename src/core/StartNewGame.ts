import type { ActiveCellType } from '../utils/types.ts';
import createNewActiveCell from './CreateNewActiveCell.ts';
import type { EventBus } from '../engine/EventBus.ts';

const startNewGame = (
    grid: { coordinate: { x: number, y: number } }[],
    startingCells: number,
    activeCellRef: ActiveCellType[],
    cellRefs: Record<string, HTMLDivElement | null>,
    size: number,
    bus: EventBus<Record<string, unknown>>,
) => {
  const newCells: ActiveCellType[] = [];

  for (let i = 0; i < startingCells; i++) {
    const cell = createNewActiveCell(
      grid,
      activeCellRef,
      cellRefs,
      size,
    );

    if (cell) {
      newCells.push(cell);
    }
  }
  return newCells;
};

export default startNewGame;
