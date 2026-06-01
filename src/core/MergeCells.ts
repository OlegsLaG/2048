import type { ActiveCellType } from '../utils/types.ts';

const mergeCells = (movedCells: ActiveCellType[]) => {
  const merged: ActiveCellType[] = [];
  let gainedScore = 0;

  for (let i = 0; i < movedCells.length; i++) {
    const currentCell = movedCells[i];
    const nextCell = movedCells[i + 1];

    if (nextCell && currentCell.value === nextCell.value) {
      const value = currentCell.value * 2;

      gainedScore += value;

      merged.push({
        ...currentCell,
        value,
        is_merged: true,
        hidden: false,
      });

      i++;
    } else {
      merged.push({
        ...currentCell,
        is_merged: false,
      });
    }
  }

  return { merged, gainedScore };
};

export default mergeCells;
