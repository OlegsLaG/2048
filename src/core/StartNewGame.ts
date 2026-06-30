import type { ActiveCellType } from '../utils/types.ts';
import createNewActiveCell from './CreateNewActiveCell.ts';

const startNewGame = (
    grid: { coordinate: { x: number, y: number } }[],
    startingCells: number,
    activeCellRef: ActiveCellType[],
    cellRefs: Record<string, HTMLDivElement | null>,
    size: number,
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
